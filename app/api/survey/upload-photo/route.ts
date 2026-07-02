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
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json(
      { error: message, code: "R2_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
}
