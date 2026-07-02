import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });

import { readFileSync } from "node:fs";

import {
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKey = process.env.R2_ACCESS_KEY_ID!;
  const secret = process.env.R2_SECRET_ACCESS_KEY!;
  const bucket = process.env.R2_BUCKET_NAME!;

  console.log("Account:", accountId);
  console.log("Bucket: ", bucket);
  console.log("AccKey: ", accessKey);
  console.log("");

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secret },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  console.log("== HeadBucket ==");
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log("  OK — bucket exists and credentials can reach it.");
  } catch (e) {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    console.log(
      "  FAIL —",
      err.name,
      "HTTP",
      err.$metadata?.httpStatusCode,
    );
  }

  console.log("\n== ListObjects ==");
  try {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }),
    );
    console.log(
      "  OK —",
      res.KeyCount ?? 0,
      "object(s). First few:",
      (res.Contents ?? []).map((o) => o.Key).slice(0, 3),
    );
  } catch (e) {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number }; message?: string };
    console.log(
      "  FAIL —",
      err.name,
      "HTTP",
      err.$metadata?.httpStatusCode,
      err.message,
    );
  }

  console.log("\n== PutObject (direct, no presign) ==");
  try {
    const buf = readFileSync("/tmp/test.jpg");
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `_diag/${Date.now()}.jpg`,
        ContentType: "image/jpeg",
        Body: buf,
      }),
    );
    console.log("  OK — direct PutObject succeeded (write permission OK).");
  } catch (e) {
    const err = e as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
      message?: string;
    };
    console.log(
      "  FAIL —",
      err.name,
      "HTTP",
      err.$metadata?.httpStatusCode,
      err.message,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
