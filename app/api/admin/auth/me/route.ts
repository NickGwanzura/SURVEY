import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: admin.user.id,
      email: admin.user.email,
      name: admin.user.name,
      role: admin.user.role,
      lastLoginAt: admin.user.lastLoginAt,
    },
  });
}
