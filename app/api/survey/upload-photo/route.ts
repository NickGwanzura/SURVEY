import { type NextRequest, NextResponse } from "next/server";

import { createSignedPhotoUpload } from "@/lib/r2";
import { photoUploadRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
    const signed = await createSignedPhotoUpload(parsed.data.contentType);
    return NextResponse.json(signed);
  } catch (err) {
    console.error("[POST /api/survey/upload-photo] Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Image storage service is temporarily unavailable.", code: "R2_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
}
