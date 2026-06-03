import { Elysia, t } from "elysia";
import { db } from "../../db";
import { videos } from "../../db/schemas/video";
import { eq } from "drizzle-orm";
import { transcodeQueue } from "../../queue";

export const videoModule = new Elysia({ prefix: "/video" }).get(
  "/:id",
  async ({ params, set }) => {
    const { id } = params;

    const video = await db.query.videos.findFirst({
      where: eq(videos.id, id),
    });

    if (!video) {
      set.status = 404;
      return { error: "Video not found" };
    }

    let progress = 0;
    let logs: string[] = [];
    let jobStatus = video.status;

    // Fetch realtime progress and logs from BullMQ if active
    if (video.status === "PENDING" || video.status === "PROCESSING") {
      try {
        const job = await transcodeQueue.getJob(id); // jobId matches video.id
        if (job) {
          progress = typeof job.progress === "number" ? job.progress : 0;
          
          const jobLogs = await transcodeQueue.getJobLogs(job.id!);
          logs = jobLogs.logs;

          const state = await job.getState();
          if (state === "completed") {
            jobStatus = "COMPLETED";
            progress = 100;
          } else if (state === "failed") {
            jobStatus = "FAILED";
          }
        }
      } catch (error) {
        console.error("Failed to fetch BullMQ job details:", error);
      }
    } else if (video.status === "COMPLETED") {
      progress = 100;
    }

    return {
      id: video.id,
      status: jobStatus,
      progress,
      logs,
      resolutions: video.resolutions,
      originalUrl: video.originalUrl,
      hlsUrl: video.hlsUrl,
      dashUrl: video.dashUrl,
      duration: video.duration,
      error: video.error,
      createdAt: video.createdAt,
    };
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      summary: "Get Video Status",
      description: "Fetch the processing status, progress, and logs of a transcoding video",
      tags: ["Video"],
    },
  }
);
