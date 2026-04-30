import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ENDPOINT = process.env.R2_ACCOUNT_ID
  ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : null;

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    if (
      !R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY
    ) {
      throw new Error(
        "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env.local.",
      );
    }
    client = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      // R2 rejects the CRC32 checksum headers AWS SDK v3.700+ adds by default.
      // Force "WHEN_REQUIRED" so presigned PUTs do not include them.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

function requireBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not set.");
  }
  return bucket;
}

function requirePublicUrl(): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL is not set.");
  }
  return publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
}

export type SignedPhotoUpload = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresInSeconds: number;
};

export async function createSignedPhotoUpload(
  contentType: string,
): Promise<SignedPhotoUpload> {
  const bucket = requireBucket();
  const publicUrl = requirePublicUrl();
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";

  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, "0");
  const key = `technicians/${year}/${month}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getClient(), command, {
    expiresIn: 300,
  });

  return {
    uploadUrl,
    publicUrl: `${publicUrl}/${key}`,
    key,
    expiresInSeconds: 300,
  };
}
