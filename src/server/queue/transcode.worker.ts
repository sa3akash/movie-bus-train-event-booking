import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../db";
import { videos } from "../db/schemas/video";
import { eq } from "drizzle-orm";
import { pipeline } from "stream/promises";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "auto",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";

// Helper to probe video metadata
const probeVideo = (filePath: string): Promise<ffmpeg.FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
};

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const transcodeWorker = new Worker(
  "video-transcode",
  async (job: Job) => {
    const { videoId, s3Key } = job.data;
    
    // Create unique temp directory for this job
    const workDir = path.join(os.tmpdir(), `transcode-${videoId}`);
    const originalPath = path.join(workDir, "original.mp4");
    const outputDir = path.join(workDir, "output");
    
    try {
      await db.update(videos).set({ status: "PROCESSING" }).where(eq(videos.id, videoId));
      
      await fs.mkdir(workDir, { recursive: true });
      await fs.mkdir(outputDir, { recursive: true });

      job.log("Downloading original video from S3...");
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
      const { Body } = await s3Client.send(getCommand);
      
      if (!Body) throw new Error("No body returned from S3");
      
      const fileHandle = await fs.open(originalPath, 'w');
      const fileStream = fileHandle.createWriteStream();
      
      // Node 18+ Web Stream to Node Stream conversion
      // AWS SDK v3 returns a stream or a readable
      await pipeline(Body as any, fileStream);
      
      job.log("Probing video to determine valid resolutions...");
      const metadata = await probeVideo(originalPath);
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const height = videoStream?.height || 0;
      const duration = metadata.format.duration ? String(metadata.format.duration) : "0";

      // Define standard resolutions
      const standardRes = [
        { name: "240p", h: 240, bitrate: "400k" },
        { name: "360p", h: 360, bitrate: "800k" },
        { name: "480p", h: 480, bitrate: "1500k" },
        { name: "720p", h: 720, bitrate: "3000k" },
        { name: "1080p", h: 1080, bitrate: "6000k" },
        { name: "1440p", h: 1440, bitrate: "12000k" }, // 2K
        { name: "2160p", h: 2160, bitrate: "25000k" } // 4K
      ];

      // Only transcode to resolutions up to the original height (no upscaling)
      const targetRes = standardRes.filter(r => r.h <= height);
      if (targetRes.length === 0 && height > 0) {
        // Fallback if video is tiny
        targetRes.push(standardRes[0]);
      }

      const generatedFiles: string[] = [];
      const generatedResolutions: string[] = [];
      
      // We need an audio stream extracted first
      const audioPath = path.join(workDir, `audio.mp4`);
      job.log("Extracting audio stream...");
      await job.updateProgress(5);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(originalPath)
          .outputOptions([
            "-c:a aac",
            "-b:a 128k",
            "-vn" // No video
          ])
          .output(audioPath)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
      });
      generatedFiles.push(audioPath);
      await job.updateProgress(10);

      // Transcode each resolution using fluent-ffmpeg
      let currentResIndex = 0;
      for (const res of targetRes) {
        job.log(`Transcoding ${res.name}...`);
        const outPath = path.join(workDir, `video_${res.name}.mp4`);
        
        await new Promise<void>((resolve, reject) => {
          ffmpeg(originalPath)
            .size(`?x${res.h}`)
            .videoCodec('libx264')
            .outputOptions([
              `-b:v ${res.bitrate}`,
              "-maxrate " + res.bitrate,
              "-bufsize " + res.bitrate,
              "-profile:v main",
              "-preset fast",
              "-g 48", // Keyframe interval (assuming ~24fps, keyframe every 2s)
              "-an" // No audio
            ])
            .output(outPath)
            .on("progress", (p) => {
              // p.percent can be undefined or negative sometimes in ffmpeg
              if (p.percent && p.percent > 0) {
                // Base 10% for audio. 80% split among targetRes.
                const fractionPerRes = 80 / targetRes.length;
                const completedResProgress = currentResIndex * fractionPerRes;
                const currentResProgress = (p.percent / 100) * fractionPerRes;
                const totalProgress = 10 + completedResProgress + currentResProgress;
                
                // Only update if it's a valid number between 10 and 90
                if (!isNaN(totalProgress)) {
                  // Fire and forget progress update
                  job.updateProgress(Math.min(90, Math.round(totalProgress))).catch(() => {});
                }
              }
            })
            .on("end", () => resolve())
            .on("error", (err) => reject(err))
            .run();
        });
        
        generatedFiles.push(outPath);
        generatedResolutions.push(res.name);
        currentResIndex++;
      }

      await job.updateProgress(90);

      // Run Shaka Packager
      job.log("Running Shaka Packager to generate DASH and HLS...");
      
      // Build Shaka Packager command arguments
      const shakaArgs = [];
      shakaArgs.push(`in=${audioPath},stream=audio,output=${outputDir}/audio.mp4,playlist_name=audio.m3u8,hls_group_id=audio,hls_name=ENGLISH`);
      
      for (const res of targetRes) {
        shakaArgs.push(`in=${path.join(workDir, `video_${res.name}.mp4`)},stream=video,output=${outputDir}/video_${res.name}.mp4,playlist_name=video_${res.name}.m3u8,iframe_playlist_name=video_${res.name}_iframe.m3u8`);
      }
      
      const shakaCmd = `shaka-packager ${shakaArgs.map(a => `'${a}'`).join(' ')} \\
        --mpd_output ${outputDir}/manifest.mpd \\
        --hls_master_playlist_output ${outputDir}/master.m3u8 \\
        --segment_duration 4`;
      
      await new Promise<void>((resolve, reject) => {
        exec(shakaCmd, (error, stdout, stderr) => {
          if (error) {
            console.error("Shaka error:", stderr);
            return reject(error);
          }
          resolve();
        });
      });

      job.log("Uploading HLS/DASH outputs to Minio...");
      await job.updateProgress(95);
      // Read output directory and upload all files
      const uploadFiles = await fs.readdir(outputDir);
      
      const s3Prefix = `videos/processed/${videoId}`;
      const uploadPromises = uploadFiles.map(async (filename) => {
        const filePath = path.join(outputDir, filename);
        const fileData = await fs.readFile(filePath);
        
        let contentType = "application/octet-stream";
        if (filename.endsWith('.mpd')) contentType = "application/dash+xml";
        else if (filename.endsWith('.m3u8')) contentType = "application/x-mpegURL";
        else if (filename.endsWith('.mp4')) contentType = "video/mp4";
        
        const fileKey = `${s3Prefix}/${filename}`;
        
        return s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: fileKey,
            Body: fileData,
            ContentType: contentType,
            // Since bucket policy makes things public, no ACL needed
          })
        );
      });
      
      await Promise.all(uploadPromises);

      const publicEndpoint = process.env.MINIO_PUBLIC_URL;
      const hlsUrl = `${publicEndpoint}/${bucket}/${s3Prefix}/master.m3u8`;
      const dashUrl = `${publicEndpoint}/${bucket}/${s3Prefix}/manifest.mpd`;

      job.log("Updating database...");
      await db.update(videos).set({
        status: "COMPLETED",
        hlsUrl,
        dashUrl,
        resolutions: generatedResolutions,
        duration: duration
      }).where(eq(videos.id, videoId));

      job.log("Transcoding job completed successfully.");
      await job.updateProgress(100);
    } catch (error: any) {
      console.error("Transcode Job Failed:", error);
      await db.update(videos).set({
        status: "FAILED",
        error: error.message || String(error)
      }).where(eq(videos.id, videoId));
      throw error;
    } finally {
      // Cleanup temp directory
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (err) {
        console.error("Failed to cleanup temp dir:", err);
      }
    }
  },
  { connection: redisConnection, concurrency: 1 }
);
