import ffmpeg from "fluent-ffmpeg";
import { Job } from "bullmq";
import path from "path";

export interface TargetResolution {
  name: string;
  h: number;
  bitrate: string;
}

export function probeVideo(filePath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}

export function getTargetResolutions(height: number): TargetResolution[] {
  const standardRes = [
    { name: "240p", h: 240, bitrate: "400k" },
    { name: "360p", h: 360, bitrate: "800k" },
    { name: "480p", h: 480, bitrate: "1500k" },
    { name: "720p", h: 720, bitrate: "3000k" },
    { name: "1080p", h: 1080, bitrate: "6000k" },
    { name: "1440p", h: 1440, bitrate: "12000k" },
    { name: "2160p", h: 2160, bitrate: "25000k" },
  ];

  const targetRes = standardRes.filter((r) => r.h <= height);
  if (targetRes.length === 0 && height > 0) {
    targetRes.push(standardRes[0]);
  }
  return targetRes;
}

export function extractAudio(originalPath: string, audioPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(originalPath)
      .outputOptions(["-c:a aac", "-b:a 128k", "-vn"])
      .output(audioPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

export function transcodeResolution(
  originalPath: string,
  outPath: string,
  res: TargetResolution,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(originalPath)
      .size(`?x${res.h}`)
      .videoCodec("libx264")
      .outputOptions([
        `-b:v ${res.bitrate}`,
        "-maxrate " + res.bitrate,
        "-bufsize " + res.bitrate,
        "-profile:v main",
        "-preset fast",
        "-g 48",
        "-an",
      ])
      .output(outPath)
      .on("progress", (p) => {
        if (p.percent && p.percent > 0) {
          onProgress(p.percent);
        }
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}
