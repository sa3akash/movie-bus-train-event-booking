import { Worker, Job } from "bullmq";
import path from "path";
import { db } from "../../db";
import { videos } from "../../db/schemas/video";
import { eq } from "drizzle-orm";
import { transcodeResolution } from "../transcoder/ffmpeg";
import { redisConnection } from "../index";
import { resourceManager } from "../cpu-manager";
import os from "os";

export const transcodeWorker = new Worker(
  "video-transcode",
  async (job: Job) => {
    const { videoId, workDir, originalPath, res } = job.data;

    try {
      job.log(`Transcoding ${res.name}...`);
      const outPath = path.join(workDir, `video_${res.name}.mp4`);
      
      await transcodeResolution(originalPath, outPath, res, (percent) => {
        job.updateProgress(Math.round(percent)).catch(() => {});
      });

      job.log(`Transcoding ${res.name} completed successfully.`);
      return res.name;
    } catch (error: any) {
      console.error(`Transcode Job Failed for ${res.name}:`, error);
      await db.update(videos).set({
        status: "FAILED",
        error: error.message || String(error),
      }).where(eq(videos.id, videoId));
      throw error;
    }
  },
  { 
    connection: redisConnection, 
    concurrency: resourceManager.getTranscodeWorkerConcurrency() 
  }
);
