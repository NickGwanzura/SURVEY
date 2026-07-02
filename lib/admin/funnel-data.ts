import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type FunnelData = Array<{
  step: number;
  stepName: string;
  views: number;
  completes: number;
  dropOffs: number;
  conversionRate: number; // % of previous step that completed this one
}>;

export async function getFunnelData(): Promise<FunnelData> {
  const STEP_NAMES = [
    "Background Information",
    "Skills and Training",
    "Tools and Resources",
    "Work Challenges and Environment",
    "Energy Efficiency",
    "Consent and Submission",
  ];

  let rows: { rows: unknown[] };
  try {
    rows = await db.execute(sql`
      SELECT 
        step,
        step_name,
        COUNT(*) FILTER (WHERE event = 'view')::int AS views,
        COUNT(*) FILTER (WHERE event = 'complete')::int AS completes
      FROM survey_events
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY step, step_name
      ORDER BY step
    `);
  } catch {
    // Table may not exist or DB error — return empty funnel gracefully
    rows = { rows: [] };
  }

  const data: FunnelData = [];
  let prevCompletes = 0;

  for (let i = 0; i < STEP_NAMES.length; i++) {
    const row = (rows.rows as Array<{ step: number; step_name: string; views: number; completes: number }>)
      .find((r) => r.step === i);
    
    const views = row?.views ?? 0;
    const completes = row?.completes ?? 0;
    const dropOffs = Math.max(0, views - completes);
    
    const conversionRate = prevCompletes > 0 
      ? Number(((completes / prevCompletes) * 100).toFixed(1))
      : views > 0 ? 100 : 0;
    
    data.push({
      step: i,
      stepName: STEP_NAMES[i] ?? `Step ${i + 1}`,
      views,
      completes,
      dropOffs,
      conversionRate,
    });
    
    prevCompletes = completes;
  }

  return data;
}
