import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth-server";
import { listSystemEvents } from "@/lib/admin/system-events";

export const runtime = "nodejs";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(200).optional().default(50),
  eventType: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Restricted to the designated sysadmin email
  const sysadminEmail = process.env.SYSADMIN_EMAIL || "nicholas.gwanzura@outlook.com";
  if (admin.user.email !== sysadminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const raw: Record<string, string> = {};
    for (const [key, val] of searchParams.entries()) {
      raw[key] = val;
    }

    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const result = await listSystemEvents(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/admin/system-events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
