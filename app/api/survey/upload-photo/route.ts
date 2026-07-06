import { type NextRequest, NextResponse } from "next/server";

import { createSignedPhotoUpload } from "@/lib/r2";
import { photoUploadRequestSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Rate limit: 10 upload URL requests per IP per minute
  const { allowed, retryAfter } = await checkRateLimit(
    `survey-upload-photo:${getClientIp(req)}`,
    10,
    60_000,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = photoUploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const signed = await createSignedPhotoUpload(
      parsed.data.contentType,
      parsed.data.byteLength,
    );
    return NextResponse.json(signed);
  } catch (err) {
    console.error("[POST /api/survey/upload-photo] Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Image storage service is temporarily unavailable.", code: "R2_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
}
