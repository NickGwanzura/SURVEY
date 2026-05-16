import "server-only";
import { count, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import type { Province } from "@/lib/constants/provinces";

export type CoverageGapData = {
  provinceCoverage: Array<{
    province: Province;
    label: string;
    count: number;
    hasSubmissions: boolean;
  }>;
  topSuburbs: Array<{ suburb: string; city: string; province: string; count: number }>;
  zeroSubmissionSuburbs: Array<{ suburb: string; city: string; province: string }>;
  totalSuburbs: number;
  coveredSuburbs: number;
};

export async function getCoverageData(): Promise<CoverageGapData> {
  const provinceRows = await db
    .select({ province: techniciansSurvey.province, count: count() })
    .from(techniciansSurvey)
    .groupBy(techniciansSurvey.province);

  const provinceMap = new Map(provinceRows.map((r) => [r.province, r.count]));

  const suburbRows = await db.execute(sql`
    SELECT suburb, city, province, COUNT(*)::int AS count
    FROM technicians_survey
    GROUP BY suburb, city, province
    ORDER BY count DESC
    LIMIT 20
  `);

  const allSuburbs = await db.execute(sql`
    SELECT DISTINCT suburb, city, province
    FROM technicians_survey
    ORDER BY province, city, suburb
  `);

  const allSuburbList = (allSuburbs.rows as Array<{ suburb: string; city: string; province: string }>);
  const coveredSet = new Set(allSuburbList.map((r) => `${r.suburb}|${r.city}|${r.province}`));

  return {
    provinceCoverage: PROVINCES.map((prov) => ({
      province: prov as Province,
      label: PROVINCE_LABELS[prov as Province] ?? prov,
      count: provinceMap.get(prov) ?? 0,
      hasSubmissions: (provinceMap.get(prov) ?? 0) > 0,
    })),
    topSuburbs: (suburbRows.rows as Array<{ suburb: string; city: string; province: string; count: number }>),
    zeroSubmissionSuburbs: [], // Would need external suburb list; for now empty
    totalSuburbs: coveredSet.size,
    coveredSuburbs: coveredSet.size,
  };
}
