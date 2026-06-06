import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";

export const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "auto",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

export const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";

export async function downloadFromS3(s3Key: string, destPath: string) {
  const getCommand = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
  const { Body } = await s3Client.send(getCommand);
  if (!Body) throw new Error("No body returned from S3");

  const fileHandle = await fs.open(destPath, "w");
  const fileStream = fileHandle.createWriteStream();
  await pipeline(Body as any, fileStream);
}

export async function uploadDirectoryToS3(dirPath: string, s3Prefix: string) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const uploadPromises = entries.map(async (entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const fileKey = `${s3Prefix}/${entry.name}`;

    if (entry.isDirectory()) {
      // Recursively upload subdirectory
      return uploadDirectoryToS3(fullPath, fileKey);
    }

    const fileData = await fs.readFile(fullPath);

    let contentType = "application/octet-stream";
    if (entry.name.endsWith(".mpd")) contentType = "application/dash+xml";
    else if (entry.name.endsWith(".m3u8")) contentType = "application/x-mpegURL";
    else if (entry.name.endsWith(".mp4")) contentType = "video/mp4";
    else if (entry.name.endsWith(".m4s")) contentType = "video/iso.segment";
    else if (entry.name.endsWith(".vtt")) contentType = "text/vtt";
    else if (entry.name.endsWith(".jpg") || entry.name.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (entry.name.endsWith(".png")) contentType = "image/png";

    return s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: fileData,
        ContentType: contentType,
      })
    );
  });

  await Promise.all(uploadPromises);
}
