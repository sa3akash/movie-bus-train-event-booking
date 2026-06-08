import { Worker, Job } from "bullmq";
import fs from "fs/promises";
import path from "path";
import os from "os";
import sharp from "sharp";
import { db } from "../../db";
import { videos } from "../../db/schemas/video";
import { eq } from "drizzle-orm";
import { downloadFromS3 } from "../transcoder/s3";
import { probeVideo, getTargetResolutions, extractAudio, generateThumbnails, generateStoryboardSprite, getThumbnailTimestamps, generateStoryboardVtt, generateBlurData } from "../transcoder/ffmpeg";
import { redisConnection, flowProducer } from "../index";
import { resourceManager } from "../cpu-manager";

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
      console.log("[Analyze Worker] Generating thumbnails...");
      const thumbnailTimestamps = getThumbnailTimestamps(durationFloat, 4);
      const thumbnailFiles = await generateThumbnails(originalPath, thumbnailsDir, thumbnailTimestamps);
      
      job.log("Generating blur data from thumbnails...");
      console.log("[Analyze Worker] Generating blur data...");
      const blurDataPromises = thumbnailFiles.map(f => generateBlurData(f));
      const blurDataResults = await Promise.all(blurDataPromises);
      
      const blurhashes = blurDataResults.map(d => d.blurhash);
      const blurDataUrls = blurDataResults.map(d => d.blurDataUrl);
      
      const interval = Math.max(1, Math.min(10, Math.floor(durationFloat / 100)));
      const totalTiles = Math.ceil(durationFloat / interval);
      
      let columns = 10;
      let rows = 10;
      if (totalTiles < 100) {
        columns = Math.max(1, Math.ceil(Math.sqrt(totalTiles)));
        rows = Math.max(1, Math.ceil(totalTiles / columns));
      }
      
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
        console.log(`[Analyze Worker] Generating storyboard: ${quality.name}`);
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

        // Crop the extra black padding from the last image if it's not completely full
        const tilesPerImage = columns * rows;
        const lastImageTiles = totalTiles % tilesPerImage;
        if (lastImageTiles !== 0) {
          const totalImages = Math.ceil(totalTiles / tilesPerImage);
          const lastImageName = storyboardPattern.replace("%04d", String(totalImages).padStart(4, "0"));
          try {
            const lastImageRows = Math.ceil(lastImageTiles / columns);
            const croppedHeight = lastImageRows * tileHeight;
            
            // sharp can extract to a buffer, then we overwrite
            const fileBuffer = await fs.readFile(lastImageName);
            const { width } = await sharp(fileBuffer).metadata();
            if (width) {
               await sharp(fileBuffer)
                 .extract({ left: 0, top: 0, width, height: croppedHeight })
                 .toFile(lastImageName + ".tmp");
               await fs.rename(lastImageName + ".tmp", lastImageName);
            }
          } catch (e) {
            console.error(`Failed to crop last storyboard image (${lastImageName}):`, e);
          }
        }
      }

      // Step 3: Extract Audio
      job.log("Extracting audio stream...");
      console.log("[Analyze Worker] Extracting audio stream...");
      await job.updateProgress(50);
      const audioStream = metadata.streams.find((s) => s.codec_type === "audio");
      if (audioStream) {
        const audioPath = path.join(workDir, `audio.mp4`);
        await extractAudio(originalPath, audioPath);
      } else {
        job.log("No audio stream found. Skipping audio extraction.");
      }
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
  { connection: redisConnection, concurrency: resourceManager.getAnalyzeWorkerConcurrency() }
);
