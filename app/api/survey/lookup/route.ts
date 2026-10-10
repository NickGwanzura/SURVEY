import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { ZIMBABWE_PHONE_REGEX } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const PRIVATE_APPLICANT_FIELDS = new Set([
  "ipAddress", "userAgent", "dataConsentIpAddress", "dataConsentUserAgent",
  "dataConsentAcceptedAt", "dataConsentAccepted", "status", "notes",
  "registrationNumber", "submittedAt", "createdAt", "updatedAt",
]);

function applicantSafeRecord<T extends object>(record: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !PRIVATE_APPLICANT_FIELDS.has(key)),
  ) as Partial<T>;
}

const lookupSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(ZIMBABWE_PHONE_REGEX, "Invalid phone number."),
  referenceNumber: z
    .string()
    .trim()
    .regex(/^(?:[0-9a-f]{8}|[0-9a-f]{32}|[0-9a-f-]{36})$/i, "Enter your reference code."),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { phone, referenceNumber } = parsed.data;

  const ipLimit = await checkRateLimit(`survey-lookup:ip:${getClientIp(req)}`, 10, 15 * 60_000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many lookup attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } },
    );
  }
  // Keep a tighter legacy-code throttle while applicants transition from the
  // old 8-character references to full UUID references.
  if (referenceNumber.length === 8) {
    const phoneKey = createHash("sha256").update(phone).digest("hex");
    const phoneLimit = await checkRateLimit(`survey-lookup:legacy-phone:${phoneKey}`, 8, 24 * 60 * 60_000);
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: "Too many lookup attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(phoneLimit.retryAfter) } },
      );
    }
  }

  try {
    const rows = await db
      .select()
      .from(techniciansSurvey)
      .where(eq(techniciansSurvey.phone, phone));

    const normalizedReference = referenceNumber.replaceAll("-", "").toUpperCase();
    const match = rows.find((r) => {
      const normalizedId = r.id.replaceAll("-", "").toUpperCase();
      return normalizedReference.length === 32
        ? normalizedId === normalizedReference
        : normalizedReference.length === 8 && normalizedId.slice(0, 8) === normalizedReference;
    });

    if (!match) {
      return NextResponse.json(
        { error: "No application found with that phone and reference number." },
        { status: 404 },
      );
    }

    // Strip server-only metadata before returning
    return NextResponse.json(applicantSafeRecord(match));
  } catch (err) {
    console.error("[POST /api/survey/lookup]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
