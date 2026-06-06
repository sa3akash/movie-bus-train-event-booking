import { Worker, Job } from "bullmq";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { db } from "../../db";
import { videos } from "../../db/schemas/video";
import { eq } from "drizzle-orm";
import { downloadFromS3 } from "../transcoder/s3";
import { probeVideo, getTargetResolutions, extractAudio, generateThumbnails, generateStoryboardSprite, getThumbnailTimestamps, generateStoryboardVtt, generateBlurData } from "../transcoder/ffmpeg";
import { redisConnection, flowProducer } from "../index";

export const analyzeWorker = new Worker(
  "video-analyze",
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
      
      const interval = Math.max(1, Math.min(10, Math.floor(durationFloat / 100)));
      const totalTiles = Math.ceil(durationFloat / interval);
      
      let columns = Math.ceil(Math.sqrt(totalTiles));
      if (columns > 10) columns = 10;
      let rows = Math.ceil(totalTiles / columns);
      if (rows > 100) rows = 100;
      if (columns === 0) columns = 1;
      if (rows === 0) rows = 1;
      
      let videoWidth = videoStream?.width || 1280;
      let videoHeight = videoStream?.height || 720;
      
      const rotation = videoStream?.tags?.rotate || videoStream?.tags?.ROTATE;
      if (rotation === '90' || rotation === '270' || rotation === '-90') {
        const temp = videoWidth;
        videoWidth = videoHeight;
        videoHeight = temp;
      }

      const aspectRatio = videoWidth / videoHeight;
      
      const storyboardQualities = [
        { name: "high", width: 320, height: 180 },
        { name: "medium", width: 256, height: 144 },
        { name: "low", width: 160, height: 90 }
      ];

      for (const quality of storyboardQualities) {
        const storyboardPrefix = `storyboard-${quality.name}`;
        const storyboardPattern = path.join(thumbnailsDir, `${storyboardPrefix}-%04d.jpg`).replace(/\\/g, "/");
        const vttPath = path.join(thumbnailsDir, `${storyboardPrefix}.vtt`);

        let tileWidth = quality.width;
        let tileHeight = Math.round(quality.width / aspectRatio / 2) * 2;
        
        if (tileHeight > quality.height) {
          tileHeight = quality.height;
          tileWidth = Math.round(quality.height * aspectRatio / 2) * 2;
        }

        await generateStoryboardSprite(originalPath, storyboardPattern, interval, tileWidth, tileHeight, columns, rows);
        await generateStoryboardVtt(durationFloat, interval, columns, rows, tileWidth, tileHeight, vttPath, storyboardPrefix);
      }

      // Step 3: Extract Audio
      job.log("Extracting audio stream...");
      await job.updateProgress(50);
      const audioPath = path.join(workDir, `audio.mp4`);
      await extractAudio(originalPath, audioPath);
      await job.updateProgress(100);

      // Step 4: Dispatch Flow for Transcode + Package
      job.log("Dispatching transcode and package jobs...");
      
      await flowProducer.add({
        name: "package-upload",
        queueName: "video-package-upload",
        data: {
          videoId,
          s3Key,
          workDir,
          outputDir,
          targetRes,
          duration,
          thumbnailFiles,
          blurhashes,
          blurDataUrls
        },
        opts: { jobId: `package-${videoId}` },
        children: targetRes.map(res => ({
          name: `transcode-${res.name}`,
          queueName: "video-transcode",
          data: { videoId, workDir, originalPath, res },
          opts: { jobId: `transcode-${videoId}-${res.name}` }
        }))
      });

    } catch (error: any) {
      console.error("Analyze Job Failed:", error);
      await db.update(videos).set({
        status: "FAILED",
        error: error.message || String(error),
      }).where(eq(videos.id, videoId));
      throw error;
    }
  },
  { connection: redisConnection, concurrency: 2 }
);
