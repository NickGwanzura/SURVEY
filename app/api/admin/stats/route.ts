import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getStatsData } from "@/lib/admin/stats-data";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getStatsData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
