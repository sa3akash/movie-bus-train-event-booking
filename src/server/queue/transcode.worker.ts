import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { db } from "../db";
import { videos } from "../db/schemas/video";
import { eq } from "drizzle-orm";
import { downloadFromS3, uploadDirectoryToS3, bucket } from "./transcoder/s3";
import { probeVideo, getTargetResolutions, extractAudio, transcodeResolution, generateThumbnails, generateStoryboardSprite, getThumbnailTimestamps, generateStoryboardVtt, generateBlurData } from "./transcoder/ffmpeg";
import { runShakaPackager } from "./transcoder/shaka";

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const globalForWorker = globalThis as unknown as {
  transcodeWorker: Worker | undefined;
};

export const transcodeWorker = globalForWorker.transcodeWorker ?? new Worker(
  "video-transcode",
  async (job: Job) => {
    const { videoId, s3Key } = job.data;
    const workDir = path.join(os.tmpdir(), `transcode-${videoId}`);
    const originalPath = path.join(workDir, "original.mp4");
    const outputDir = path.join(workDir, "output");


    try {
      await db.update(videos).set({ status: "PROCESSING" }).where(eq(videos.id, videoId));
      
      await fs.mkdir(workDir, { recursive: true });
      await fs.mkdir(outputDir, { recursive: true });
      
      const thumbnailsDir = path.join(outputDir, "thumbnails");
      await fs.mkdir(thumbnailsDir, { recursive: true });

      // Step 1: Download Original
      job.log("Downloading original video from S3...");
      await downloadFromS3(s3Key, originalPath);

      // Step 2: Probe Video
      job.log("Probing video metadata...");
      const metadata = await probeVideo(originalPath);
      const videoStream = metadata.streams.find((s) => s.codec_type === "video");
      const height = videoStream?.height || 0;
      const durationFloat = parseFloat(`${metadata.format.duration}` || "0");
      const duration = String(durationFloat);
      const targetRes = getTargetResolutions(height);

      // Step 2.5: Generate Thumbnails & Storyboard
      job.log("Generating thumbnails and storyboard...");
      const thumbnailTimestamps = getThumbnailTimestamps(durationFloat, 4);
      const thumbnailFiles = await generateThumbnails(originalPath, thumbnailsDir, thumbnailTimestamps);
      
      job.log("Generating blur data from thumbnails...");
      const blurDataPromises = thumbnailFiles.map(f => generateBlurData(f));
      const blurDataResults = await Promise.all(blurDataPromises);
      
      const blurhashes = blurDataResults.map(d => d.blurhash);
      const blurDataUrls = blurDataResults.map(d => d.blurDataUrl);
      
      const storyboardPrefix = "storyboard";
      // Ensure forward slashes for ffmpeg image2 pattern to prevent \t escaping issues on Windows
      const storyboardPattern = path.join(thumbnailsDir, `${storyboardPrefix}-%04d.jpg`).replace(/\\/g, "/");
      const vttPath = path.join(thumbnailsDir, "storyboard.vtt");
      
      const interval = Math.max(1, Math.min(10, Math.floor(durationFloat / 100)));
      const columns = 10;
      const rows = 10;
      
      let videoWidth = videoStream?.width || 1280;
      let videoHeight = videoStream?.height || 720;
      
      // Handle mobile video rotation metadata (Reels/TikToks)
      const rotation = videoStream?.tags?.rotate || videoStream?.tags?.ROTATE;
      if (rotation === '90' || rotation === '270' || rotation === '-90') {
        const temp = videoWidth;
        videoWidth = videoHeight;
        videoHeight = temp;
      }

      const aspectRatio = videoWidth / videoHeight;
      
      let tileWidth = 160;
      let tileHeight = Math.round(160 / aspectRatio);
      
      // Strict bounding box: never exceed 160px width or 90px height!
      if (tileHeight > 90) {
        tileHeight = 90;
        tileWidth = Math.round(90 * aspectRatio);
      }

      await generateStoryboardSprite(originalPath, storyboardPattern, interval, tileWidth, tileHeight, columns, rows);
      await generateStoryboardVtt(durationFloat, interval, columns, rows, tileWidth, tileHeight, vttPath, storyboardPrefix);

      // Step 3: Extract Audio
      job.log("Extracting audio stream...");
      await job.updateProgress(5);
      const audioPath = path.join(workDir, `audio.mp4`);
      await extractAudio(originalPath, audioPath);
      await job.updateProgress(10);

      // Step 4: Transcode Video Resolutions
      const generatedResolutions: string[] = [];
      let currentResIndex = 0;
      for (const res of targetRes) {
        job.log(`Transcoding ${res.name}...`);
        const outPath = path.join(workDir, `video_${res.name}.mp4`);
        
        await transcodeResolution(originalPath, outPath, res, (percent) => {
          const fractionPerRes = 80 / targetRes.length;
          const completedResProgress = currentResIndex * fractionPerRes;
          const currentResProgress = (percent / 100) * fractionPerRes;
          const totalProgress = 10 + completedResProgress + currentResProgress;
          if (!isNaN(totalProgress)) {
            job.updateProgress(Math.min(90, Math.round(totalProgress))).catch(() => {});
          }
        });
        
        generatedResolutions.push(res.name);
        currentResIndex++;
      }
      await job.updateProgress(90);

      // Step 5: Package with Shaka
      job.log("Running Shaka Packager to generate DASH and HLS...");
      await runShakaPackager(audioPath, workDir, outputDir, targetRes);

      // Step 6: Upload to S3
      job.log("Uploading HLS/DASH outputs to Minio...");
      await job.updateProgress(95);
      const s3Prefix = `videos/processed/${videoId}`;
      await uploadDirectoryToS3(outputDir, s3Prefix);

      // Step 7: Update DB
      const publicEndpoint = process.env.MINIO_PUBLIC_URL;
      await db.update(videos).set({
        status: "COMPLETED",
        hlsUrl: `${publicEndpoint}/${bucket}/${s3Prefix}/master.m3u8`,
        dashUrl: `${publicEndpoint}/${bucket}/${s3Prefix}/manifest.mpd`,
        resolutions: generatedResolutions,
        thumbnails: thumbnailFiles.map(f => `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/${path.basename(f)}`),
        blurhashes,
        blurDataUrls,
        storyboardUrl: `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/storyboard.vtt`,
        duration,
      }).where(eq(videos.id, videoId));

      job.log("Transcoding job completed successfully.");
      await job.updateProgress(100);
    } catch (error: any) {
      console.error("Transcode Job Failed:", error);
      await db.update(videos).set({
        status: "FAILED",
        error: error.message || String(error),
      }).where(eq(videos.id, videoId));
      throw error;
    } finally {
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (err) {
        console.error("Failed to cleanup temp dir:", err);
      }
    }
  },
  { connection: redisConnection, concurrency: 1 }
);

if (process.env.NODE_ENV !== "production") {
  globalForWorker.transcodeWorker = transcodeWorker;
}
