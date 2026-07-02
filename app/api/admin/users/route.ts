import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import { listAdminUsers } from "@/lib/admin/admin-users-data";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await listAdminUsers();
    return NextResponse.json({ users: data });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
