import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getInsightsData } from "@/lib/admin/insights-data";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getInsightsData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/admin/insights]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
