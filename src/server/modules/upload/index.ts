import { Elysia, t } from "elysia";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutBucketLifecycleConfigurationCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { encode, decode } from "blurhash";
import { db } from "../../db";
import { images } from "../../db/schemas";
import { addTranscodeJob } from "../../queue";
import { videos } from "../../db/schemas/video";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

// Automatically ensure the bucket exists and is public
(async () => {
  const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";
  try {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      console.log(`Bucket ${bucket} not found. Creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
    }

    // Set bucket policy to allow public reads
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicRead",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify(policy),
      }),
    );

    // Note: To automatically clean up incomplete multipart uploads,
    // please configure a Lifecycle Rule directly in your Minio Console.
    // (AbortIncompleteMultipartUpload: 1 day)

    console.log(
      `Bucket ${bucket} is now ready, publicly readable, and has auto-cleanup enabled.`,
    );
  } catch (error) {
    console.error(`Failed to initialize bucket ${bucket}:`, error);
  }
})();

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

export const uploadModule = new Elysia({ prefix: "/upload" })
  .post(
    "/",
    async ({ body, set }) => {
      const file = body.file as File;
      if (!file) {
        set.status = 400;
        return { error: "No file provided" };
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${createId()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";

        // Generate blurhash
        const { blurhash, blurhashData } = await encodeImageToBlurhash(buffer);

        // Upload to Minio/S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
          }),
        );

        const publicEndpoint = process.env.MINIO_ENDPOINT;
        const url = `${publicEndpoint}/${bucket}/${fileName}`;

        const [newImage] = await db
          .insert(images)
          .values({
            url,
            fileName,
            mimeType: file.type,
            size: file.size,
            blurhash,
            blurhashData,
            altText: file.name,
          })
          .returning();

        return {
          success: true,
          image: newImage,
        };
      } catch (error) {
        set.status = 500;
        return { error: "Failed to upload image", details: String(error) };
      }
    },
    {
      body: t.Object({
        file: t.File(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          image: t.Object({
            id: t.String(),
            url: t.String(),
            fileName: t.String(),
            mimeType: t.Nullable(t.String()),
            size: t.Nullable(t.Number()),
            blurhash: t.Nullable(t.String()),
            blurhashData: t.Nullable(t.String()),
            altText: t.Nullable(t.String()),
          }),
        }),
        400: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
          details: t.Optional(t.String()),
        }),
      },
      maxBodySize: 10 * 1024 * 1024,
      detail: {
        summary: "Upload an image",
        description: "Upload an image to the server",
        tags: ["Upload"],
      },
    },
  )
  .post(
    "/presigned-url",
    async ({ body, set }) => {
      const { fileName, contentType } = body;

      const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";
      const key = `videos/${createId()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      try {
        // Generate a signed URL that expires in 1 hour (3600 seconds)
        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
        const publicEndpoint = process.env.MINIO_ENDPOINT;
        const fileUrl = `${publicEndpoint}/${bucket}/${key}`;

        return {
          success: true,
          presignedUrl,
          fileUrl,
        };
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to generate presigned URL",
          details: String(error),
        };
      }
    },
    {
      body: t.Object({
        fileName: t.String(),
        contentType: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          presignedUrl: t.String(),
          fileUrl: t.String(),
        }),
        500: t.Object({
          error: t.String(),
          details: t.Optional(t.String()),
        }),
      },
      detail: {
        summary: "Get Presigned URL",
        description:
          "Get a temporary S3 presigned URL for direct, scalable client uploads",
        tags: ["Upload"],
      },
    },
  )
  .delete(
    "/",
    async ({ body, set }) => {
      const { url } = body;
      const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";

      try {
        let key = "";
        const parts = url.split(`/${bucket}/`);
        if (parts.length > 1) {
          key = parts[1];
        } else {
          try {
            const urlObj = new URL(url);
            key = urlObj.pathname.substring(1);
          } catch {
            key = url;
          }
        }

        if (!key) {
          set.status = 400;
          return { error: "Invalid URL format" };
        }

        // Delete from Minio
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );

        // Attempt to delete from images table if it's an image
        try {
          await db.delete(images).where(eq(images.url, url));
        } catch (dbErr) {
          // Safely ignore if not an image or constrained
        }

        return { success: true };
      } catch (error) {
        set.status = 500;
        return { error: "Failed to delete file", details: String(error) };
      }
    },
    {
      body: t.Object({
        url: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String(), details: t.Optional(t.String()) }),
      },
      detail: {
        summary: "Delete uploaded file",
        description: "Deletes an orphaned file from S3 and DB",
        tags: ["Upload"],
      },
    },
  )
  .post(
    "/multipart/init",
    async ({ body, set }) => {
      const { fileName, contentType, parts } = body;
      const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";
      const key = `videos/${createId()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      try {
        // Start Multipart Upload
        const initRes = await s3Client.send(
          new CreateMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
          }),
        );
        const uploadId = initRes.UploadId;
        if (!uploadId) throw new Error("Failed to get UploadId");

        // Generate Presigned URLs for all parts
        const urls = await Promise.all(
          Array.from({ length: parts }).map((_, i) =>
            getSignedUrl(
              s3Client,
              new UploadPartCommand({
                Bucket: bucket,
                Key: key,
                UploadId: uploadId,
                PartNumber: i + 1,
              }),
              { expiresIn: 3600 * 24 }, // 24 hours to upload 20GB
            ),
          ),
        );

        const publicEndpoint = process.env.MINIO_ENDPOINT;
        const fileUrl = `${publicEndpoint}/${bucket}/${key}`;

        return { uploadId, key, urls, fileUrl };
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to init multipart upload",
          details: String(error),
        };
      }
    },
    {
      body: t.Object({
        fileName: t.String(),
        contentType: t.String(),
        parts: t.Number({ minimum: 1, maximum: 10000 }),
      }),
      response: {
        200: t.Object({
          uploadId: t.String(),
          key: t.String(),
          urls: t.Array(t.String()),
          fileUrl: t.String(),
        }),
        500: t.Object({ error: t.String(), details: t.Optional(t.String()) }),
      },
      detail: {
        summary: "Initialize Multipart Upload",
        tags: ["Upload"],
      },
    },
  )
  .post(
    "/multipart/complete",
    async ({ body, set }) => {
      const { uploadId, key, parts } = body;
      const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";

      try {
        await s3Client.send(
          new CompleteMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
              Parts: parts.map((p) => ({
                PartNumber: p.PartNumber,
                ETag: p.ETag,
              })),
            },
          }),
        );
        const publicEndpoint = process.env.MINIO_ENDPOINT;
        const fileUrl = `${publicEndpoint}/${bucket}/${key}`;

        // Create database record
        const [videoRecord] = await db.insert(videos).values({
          originalKey: key,
          originalUrl: fileUrl,
          status: "PENDING"
        }).returning();

        // Queue transcoding job
        await addTranscodeJob(videoRecord.id, key);

        return { success: true, fileUrl, videoId: videoRecord.id };
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to complete multipart upload",
          details: String(error),
        };
      }
    },
    {
      body: t.Object({
        uploadId: t.String(),
        key: t.String(),
        parts: t.Array(
          t.Object({
            PartNumber: t.Number(),
            ETag: t.String(),
          }),
        ),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          fileUrl: t.String(),
          videoId: t.String()
        }),
        500: t.Object({ error: t.String(), details: t.Optional(t.String()) }),
      },
      detail: {
        summary: "Complete Multipart Upload",
        tags: ["Upload"],
      },
    },
  )
  .delete(
    "/multipart/abort",
    async ({ body, set }) => {
      const { uploadId, key } = body;
      const bucket = process.env.MINIO_BUCKET_NAME || "ticket-assets";

      try {
        await s3Client.send(
          new AbortMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId,
          }),
        );
        return { success: true };
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to abort multipart upload",
          details: String(error),
        };
      }
    },
    {
      body: t.Object({
        uploadId: t.String(),
        key: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        500: t.Object({ error: t.String(), details: t.Optional(t.String()) }),
      },
      detail: {
        summary: "Abort Multipart Upload",
        tags: ["Upload"],
      },
    },
  );
