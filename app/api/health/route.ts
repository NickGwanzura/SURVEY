import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Perform a simple query to ensure the database connection is alive
    await db.execute(sql`SELECT 1`);

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "up",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/health] Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "down",
        },
      },
      { status: 503 },
    );
  }
}
