import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth-server";
import { analyzeReportData } from "@/lib/admin/ai-analysis";

const analyzeReportSchema = z.object({
  reportType: z.string().min(1),
  reportLabel: z.string().min(1),
  data: z.record(z.array(z.object({
    label: z.union([z.string(), z.number()]),
    count: z.number(),
  }))),
  sampleSize: z.number().int().nonnegative(),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured. Contact the system administrator." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = analyzeReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { reportType, reportLabel, data, sampleSize } = parsed.data;

  try {
    const result = await analyzeReportData(reportLabel, sampleSize, data as unknown as Record<string, unknown>);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/admin/ai-analyze/report]", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
