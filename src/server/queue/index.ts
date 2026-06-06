import { Queue, FlowProducer } from "bullmq";
import Redis from "ioredis";

// Reuse the standard Redis URL or default to localhost
export const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: true,
};

export const analyzeQueue = new Queue("video-analyze", {
  connection: redisConnection,
  defaultJobOptions,
});

export const transcodeQueue = new Queue("video-transcode", {
  connection: redisConnection,
  defaultJobOptions,
});

export const packageUploadQueue = new Queue("video-package-upload", {
  connection: redisConnection,
  defaultJobOptions,
});

export const flowProducer = new FlowProducer({ connection: redisConnection });

export async function addTranscodeJob(videoId: string, s3Key: string) {
  await analyzeQueue.add("analyze", { videoId, s3Key }, { jobId: `analyze-${videoId}` });
}
