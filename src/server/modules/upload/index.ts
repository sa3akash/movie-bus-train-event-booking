import { Elysia, t } from "elysia";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { encode, decode } from "blurhash";
import { db } from "../../db";
import { images } from "../../db/schemas";
import { createId } from "@paralleldrive/cuid2";

const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

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

export const uploadModule = new Elysia({ prefix: "/upload" }).post(
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

      const publicEndpoint = process.env.MINIO_PUBLIC_URL;
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
);
