import { NextResponse } from "next/server";
import { desc, gt, count } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60 * 1000);

    const [newSubmissions] = await Promise.all([
      db
        .select({
          id: techniciansSurvey.id,
          firstName: techniciansSurvey.firstName,
          surname: techniciansSurvey.surname,
          status: techniciansSurvey.status,
          submittedAt: techniciansSurvey.submittedAt,
        })
        .from(techniciansSurvey)
        .where(gt(techniciansSurvey.submittedAt, sinceDate))
        .orderBy(desc(techniciansSurvey.submittedAt))
        .limit(10),
      db
        .select({ count: count() })
        .from(techniciansSurvey)
        .where(gt(techniciansSurvey.submittedAt, sinceDate))
        .limit(1),
    ]);

    return NextResponse.json({
      submissions: newSubmissions,
      since: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/admin/notifications]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
