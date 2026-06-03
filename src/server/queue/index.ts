import { Queue } from "bullmq";
import Redis from "ioredis";

// Reuse the standard Redis URL or default to localhost
const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const transcodeQueue = new Queue("video-transcode", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

export async function addTranscodeJob(videoId: string, s3Key: string) {
  await transcodeQueue.add("transcode", { videoId, s3Key }, { jobId: videoId });
}
