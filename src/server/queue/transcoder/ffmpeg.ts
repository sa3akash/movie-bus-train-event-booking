import ffmpeg from "fluent-ffmpeg";
import { Job } from "bullmq";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { decode, encode } from "blurhash";

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

export function extractAudio(
  originalPath: string,
  audioPath: string,
): Promise<void> {
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
  onProgress: (percent: number) => void,
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

export function getThumbnailTimestamps(durationSeconds: number, count: number): number[] {
  if (durationSeconds <= 0) return Array(count).fill(0);
  const timestamps: number[] = [];
  const interval = durationSeconds / (count + 1);
  for (let i = 1; i <= count; i++) {
    timestamps.push(interval * i);
  }
  return timestamps;
}

export async function generateThumbnails(
  originalPath: string,
  outputDir: string,
  timestamps: number[],
): Promise<string[]> {
  const pngFiles: string[] = await new Promise((resolve, reject) => {
    let generatedFiles: string[] = [];
    ffmpeg(originalPath)
      .on("filenames", (filenames) => {
        generatedFiles = filenames.map((f: string) => path.join(outputDir, f));
      })
      .on("end", () => resolve(generatedFiles))
      .on("error", (err) => reject(err))
      .screenshots({
        timestamps,
        folder: outputDir,
        filename: "thumbnail-%i.png",
      });
  });

  const optimizedFiles: string[] = [];
  for (const pngFile of pngFiles) {
    const webpFile = pngFile.replace(".png", ".webp");
    const fileBuffer = await fs.readFile(pngFile);
    await sharp(fileBuffer)
      .resize(1280, 720, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpFile);
    
    await fs.unlink(pngFile);
    optimizedFiles.push(webpFile);
  }

  return optimizedFiles;
}

export function generateStoryboardSprite(
  originalPath: string,
  outputPattern: string,
  intervalSeconds: number = 10,
  tileWidth: number = 160,
  tileHeight: number = 90,
  columns: number = 10,
  rows: number = 10,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(originalPath)
      .outputOptions([
        `-vf fps=1/${intervalSeconds},scale=${tileWidth}:${tileHeight},tile=${columns}x${rows}`,
      ])
      .output(outputPattern)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

// Format time for VTT: HH:MM:SS.mmm
function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, len: number = 2) => String(n).padStart(len, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

export async function generateStoryboardVtt(
  durationSeconds: number,
  intervalSeconds: number,
  columns: number,
  rows: number,
  tileWidth: number,
  tileHeight: number,
  vttPath: string,
  spriteUrlPrefix: string,
): Promise<void> {
  const tilesPerImage = columns * rows;
  let vttContent = "WEBVTT\n\n";

  for (let time = 0; time < durationSeconds; time += intervalSeconds) {
    const tileIndex = Math.floor(time / intervalSeconds);
    const imageIndex = Math.floor(tileIndex / tilesPerImage) + 1; // 1-indexed for %04d
    const indexInImage = tileIndex % tilesPerImage;

    const col = indexInImage % columns;
    const row = Math.floor(indexInImage / columns);

    const x = col * tileWidth;
    const y = row * tileHeight;

    const startTime = formatVttTime(time);
    const endTime = formatVttTime(
      Math.min(time + intervalSeconds, durationSeconds),
    );

    const imageName = `${spriteUrlPrefix}-${String(imageIndex).padStart(4, "0")}.jpg`;

    vttContent += `${startTime} --> ${endTime}\n`;
    vttContent += `${imageName}#xywh=${x},${y},${tileWidth},${tileHeight}\n\n`;
  }

  await fs.writeFile(vttPath, vttContent, "utf-8");
}

export async function generateBlurData(
  imagePath: string,
): Promise<{ blurhash: string; blurDataUrl: string }> {
  try {
    const fileBuffer = await fs.readFile(imagePath);
    const image = sharp(fileBuffer);
    const { info, data } = await image
      .resize(32, 32, { fit: "inside" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4,
    );

    // Decode blurhash back into pixels to generate a perfect, smooth placeholder
    const decodedPixels = decode(blurhash, 32, 32);
    const blurhashDataBuffer = await sharp(Buffer.from(decodedPixels), {
      raw: {
        width: 32,
        height: 32,
        channels: 4,
      },
    })
      .webp({ quality: 60 })
      .toBuffer();

    const blurDataUrl = `data:image/webp;base64,${blurhashDataBuffer.toString("base64")}`;

    return { blurhash, blurDataUrl };
  } catch (error) {
    console.error("Failed to generate blur data:", error);
    return { blurhash: "", blurDataUrl: "" };
  }
}

/*
const encodeImageToBlurhash = async (
  buffer: Buffer,
): Promise<{ blurhash: string; blurhashData: string }> => {
  const image = sharp(buffer);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4,
  );

  // Decode blurhash back into pixels to generate a perfect, smooth placeholder
  const decodedPixels = decode(blurhash, 32, 32);
  const blurhashDataBuffer = await sharp(Buffer.from(decodedPixels), {
    raw: {
      width: 32,
      height: 32,
      channels: 4,
    },
  })
    .webp({ quality: 60 })
    .toBuffer();

  const blurhashData = `data:image/webp;base64,${blurhashDataBuffer.toString("base64")}`;

  return { blurhash, blurhashData };
};

*/
