import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import type { Province } from "@/lib/constants/provinces";

export type ProvinceComparisonRow = {
  province: Province;
  label: string;
  totalSubmissions: number;
  verifiedCount: number;
  certificationRate: number;
  avgConfidenceTraditional: number;
  avgConfidenceLowGwp: number;
  confidenceGap: number;
  avgAccessTools: number;
  avgAccessSpareParts: number;
  avgAccessRefrigerants: number;
  hasGpsCount: number;
};

export async function getProvinceComparison(): Promise<ProvinceComparisonRow[]> {
  const rows = await db.execute(sql`
    SELECT 
      province,
      COUNT(*)::int AS total_submissions,
      COUNT(*) FILTER (WHERE status = 'verified')::int AS verified_count,
      COUNT(*) FILTER (WHERE has_certification = 'yes')::float / COUNT(*)::float * 100 AS cert_rate,
      AVG(confidence_traditional_refrigerants)::float AS avg_trad,
      AVG(confidence_low_gwp_refrigerants)::float AS avg_low_gwp,
      AVG(access_to_tools)::float AS avg_tools,
      AVG(access_to_spare_parts)::float AS avg_spare,
      AVG(access_to_low_gwp_refrigerants)::float AS avg_refrig,
      COUNT(*) FILTER (WHERE gps_latitude IS NOT NULL)::int AS gps_count
    FROM technicians_survey
    GROUP BY province
  `);

  const byProvince = new Map(
    (rows.rows as Array<{
      province: string;
      total_submissions: number;
      verified_count: number;
      cert_rate: number;
      avg_trad: number;
      avg_low_gwp: number;
      avg_tools: number;
      avg_spare: number;
      avg_refrig: number;
      gps_count: number;
    }>).map((r) => [r.province, r])
  );

  return PROVINCES.map((prov) => {
    const r = byProvince.get(prov);
    const trad = Number((r?.avg_trad ?? 0).toFixed(2));
    const lowGwp = Number((r?.avg_low_gwp ?? 0).toFixed(2));
    return {
      province: prov as Province,
      label: PROVINCE_LABELS[prov as Province] ?? prov,
      totalSubmissions: r?.total_submissions ?? 0,
      verifiedCount: r?.verified_count ?? 0,
      certificationRate: Number((r?.cert_rate ?? 0).toFixed(1)),
      avgConfidenceTraditional: trad,
      avgConfidenceLowGwp: lowGwp,
      confidenceGap: Number((trad - lowGwp).toFixed(2)),
      avgAccessTools: Number((r?.avg_tools ?? 0).toFixed(2)),
      avgAccessSpareParts: Number((r?.avg_spare ?? 0).toFixed(2)),
      avgAccessRefrigerants: Number((r?.avg_refrig ?? 0).toFixed(2)),
      hasGpsCount: r?.gps_count ?? 0,
    };
  });
}
