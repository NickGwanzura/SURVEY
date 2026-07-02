import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type PeriodStats = {
  label: string;
  total: number;
  verified: number;
  pending: number;
  flagged: number;
  duplicate: number;
  withCertification: number;
  withGps: number;
  avgConfidenceTraditional: number;
  avgConfidenceLowGwp: number;
};

export type TimeComparisonData = {
  currentMonth: PeriodStats;
  previousMonth: PeriodStats;
  currentQuarter: PeriodStats;
  previousQuarter: PeriodStats;
  currentYear: PeriodStats;
  previousYear: PeriodStats;
};

async function getPeriodStats(
  start: Date,
  end: Date,
  label: string,
): Promise<PeriodStats> {
  const rows = await db.execute(sql`
    SELECT 
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'verified')::int AS verified,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'flagged')::int AS flagged,
      COUNT(*) FILTER (WHERE status = 'duplicate')::int AS duplicate,
      COUNT(*) FILTER (WHERE has_certification = 'yes')::int AS cert,
      COUNT(*) FILTER (WHERE gps_latitude IS NOT NULL)::int AS gps,
      AVG(confidence_traditional_refrigerants)::float AS trad,
      AVG(confidence_low_gwp_refrigerants)::float AS low_gwp
    FROM technicians_survey
    WHERE submitted_at >= ${start.toISOString()}::timestamptz
      AND submitted_at < ${end.toISOString()}::timestamptz
  `);

  const r = (rows.rows[0] ?? {}) as {
    total: number;
    verified: number;
    pending: number;
    flagged: number;
    duplicate: number;
    cert: number;
    gps: number;
    trad: number;
    low_gwp: number;
  };

  return {
    label,
    total: r.total ?? 0,
    verified: r.verified ?? 0,
    pending: r.pending ?? 0,
    flagged: r.flagged ?? 0,
    duplicate: r.duplicate ?? 0,
    withCertification: r.cert ?? 0,
    withGps: r.gps ?? 0,
    avgConfidenceTraditional: Number((r.trad ?? 0).toFixed(2)),
    avgConfidenceLowGwp: Number((r.low_gwp ?? 0).toFixed(2)),
  };
}

export async function getTimeComparison(): Promise<TimeComparisonData> {
  const now = new Date();

  // Current month
  const cmStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const cmEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Previous month
  const pmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pmEnd = cmStart;

  // Current quarter
  const cqStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1,
  );
  const cqEnd = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3 + 3,
    1,
  );

  // Previous quarter
  const pqStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3 - 3,
    1,
  );
  const pqEnd = cqStart;

  // Current year
  const cyStart = new Date(now.getFullYear(), 0, 1);
  const cyEnd = new Date(now.getFullYear() + 1, 0, 1);

  // Previous year
  const pyStart = new Date(now.getFullYear() - 1, 0, 1);
  const pyEnd = cyStart;

  const [
    currentMonth,
    previousMonth,
    currentQuarter,
    previousQuarter,
    currentYear,
    previousYear,
  ] = await Promise.all([
    getPeriodStats(cmStart, cmEnd, "This Month"),
    getPeriodStats(pmStart, pmEnd, "Last Month"),
    getPeriodStats(cqStart, cqEnd, "This Quarter"),
    getPeriodStats(pqStart, pqEnd, "Last Quarter"),
    getPeriodStats(cyStart, cyEnd, "This Year"),
    getPeriodStats(pyStart, pyEnd, "Last Year"),
  ]);

  return {
    currentMonth,
    previousMonth,
    currentQuarter,
    previousQuarter,
    currentYear,
    previousYear,
  };
}
