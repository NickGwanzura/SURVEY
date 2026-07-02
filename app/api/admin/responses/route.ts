import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth-server";
import {
  listResponses,
  listResponsesParamsSchema,
} from "@/lib/admin/responses-data";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const raw = Object.fromEntries(searchParams.entries());

  const parsed = listResponsesParamsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await listResponses(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/admin/responses]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
