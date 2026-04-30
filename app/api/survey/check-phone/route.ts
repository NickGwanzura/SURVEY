import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { checkPhoneQuerySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  const parsed = checkPhoneQuerySchema.safeParse({ phone });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid phone number." },
      { status: 400 },
    );
  }

  const existing = await db
    .select({ id: techniciansSurvey.id })
    .from(techniciansSurvey)
    .where(eq(techniciansSurvey.phone, parsed.data.phone))
    .limit(1);

  return NextResponse.json({ exists: existing.length > 0 });
}
