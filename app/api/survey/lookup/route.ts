import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { ZIMBABWE_PHONE_REGEX } from "@/lib/validation";

const lookupSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(ZIMBABWE_PHONE_REGEX, "Invalid phone number."),
  referenceNumber: z
    .string()
    .trim()
    .min(1, "Reference number is required."),
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

  try {
    const rows = await db
      .select()
      .from(techniciansSurvey)
      .where(eq(techniciansSurvey.phone, phone));

    const match = rows.find(
      (r) => r.id.slice(0, 8).toUpperCase() === referenceNumber.toUpperCase(),
    );

    if (!match) {
      return NextResponse.json(
        { error: "No application found with that phone and reference number." },
        { status: 404 },
      );
    }

    // Strip server-only metadata before returning
    const {
      ipAddress: _ip,
      userAgent: _ua,
      ...clientData
    } = match;

    return NextResponse.json(clientData);
  } catch (err) {
    console.error("[POST /api/survey/lookup]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
