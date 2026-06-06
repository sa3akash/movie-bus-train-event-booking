import { Worker, Job } from "bullmq";
import fs from "fs/promises";
import path from "path";
import { db } from "../../db";
import { videos } from "../../db/schemas/video";
import { eq } from "drizzle-orm";
import { uploadDirectoryToS3, bucket } from "../transcoder/s3";
import { runShakaPackager } from "../transcoder/shaka";
import { redisConnection } from "../index";

export const packageUploadWorker = new Worker(
  "video-package-upload",
  async (job: Job) => {
    const { videoId, workDir, outputDir, targetRes, duration, thumbnailFiles, blurhashes, blurDataUrls } = job.data;
    
    // We can get the results from the child transcode jobs
    const childrenValues = await job.getChildrenValues();
    const generatedResolutions = Object.values(childrenValues);
    job.log(`Received completed transcode jobs: ${generatedResolutions.join(", ")}`);

    try {
      const audioPath = path.join(workDir, `audio.mp4`);

      // Step 5: Package with Shaka
      job.log("Running Shaka Packager to generate DASH and HLS...");
      await job.updateProgress(10);
      await runShakaPackager(audioPath, workDir, outputDir, targetRes);
      await job.updateProgress(50);

      // Step 6: Upload to S3
      job.log("Uploading HLS/DASH outputs to Minio...");
      const s3Prefix = `videos/processed/${videoId}`;
      await uploadDirectoryToS3(outputDir, s3Prefix);
      await job.updateProgress(90);

      // Step 7: Update DB
      const publicEndpoint = process.env.MINIO_PUBLIC_URL;
      await db.update(videos).set({
        status: "COMPLETED",
        hlsUrl: `${publicEndpoint}/${bucket}/${s3Prefix}/master.m3u8`,
        dashUrl: `${publicEndpoint}/${bucket}/${s3Prefix}/manifest.mpd`,
        resolutions: generatedResolutions,
        thumbnails: thumbnailFiles.map((f: string) => `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/${path.basename(f)}`),
        blurhashes,
        blurDataUrls,
        storyboardUrl: `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/storyboard-medium.vtt`,
        storyboards: {
          high: `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/storyboard-high.vtt`,
          medium: `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/storyboard-medium.vtt`,
          low: `${publicEndpoint}/${bucket}/${s3Prefix}/thumbnails/storyboard-low.vtt`,
        },
        duration,
      }).where(eq(videos.id, videoId));

      job.log("Packaging and upload completed successfully.");
      await job.updateProgress(100);
    } catch (error: any) {
      console.error("Package/Upload Job Failed:", error);
      await db.update(videos).set({
        status: "FAILED",
        error: error.message || String(error),
      }).where(eq(videos.id, videoId));
      throw error;
    } finally {
      // Step 8: Cleanup temp directory
      try {
        await fs.rm(workDir, { recursive: true, force: true });
        job.log(`Cleaned up temporary directory: ${workDir}`);
      } catch (err) {
        console.error("Failed to cleanup temp dir:", err);
      }
    }
  },
  { connection: redisConnection, concurrency: 2 }
);
