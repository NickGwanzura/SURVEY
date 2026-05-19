import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import {
  BIGGEST_DAILY_CHALLENGE_LABELS,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  PPE_ACCESS_LABELS,
  RECOVERY_EQUIPMENT_USE_LABELS,
  EHS_BARRIER_LABELS,
} from "@/lib/constants/challenges";
import type { Province } from "@/lib/constants/provinces";

export type ProvinceChallengeRow = {
  province: Province;
  label: string;
  totalSubmissions: number;
  topChallenges: Array<{ value: string; label: string; count: number; percent: number }>;
  loadSheddingDistribution: Array<{ value: string; label: string; count: number; percent: number }>;
  ppeFullAccessPercent: number;
  recoveryAlwaysPercent: number;
  topEhsBarriers: Array<{ value: string; label: string; count: number }>;
};

type RawCountRow = {
  province: string;
  value: string;
  count: number;
};

export async function getProvinceChallengesData(): Promise<ProvinceChallengeRow[]> {
  const [biggestChallengeRows, loadSheddingRows, ppeRows, recoveryRows, ehsRows] =
    await Promise.all([
      // Biggest daily challenge per province
      db.execute(sql`
        SELECT province, biggest_daily_challenge AS value, COUNT(*)::int AS count
        FROM technicians_survey
        GROUP BY province, biggest_daily_challenge
        ORDER BY province, count DESC
      `),
      // Load shedding frequency per province
      db.execute(sql`
        SELECT province, load_shedding_frequency AS value, COUNT(*)::int AS count
        FROM technicians_survey
        GROUP BY province, load_shedding_frequency
        ORDER BY province, count DESC
      `),
      // PPE access per province
      db.execute(sql`
        SELECT province, ppe_access AS value, COUNT(*)::int AS count
        FROM technicians_survey
        GROUP BY province, ppe_access
        ORDER BY province, count DESC
      `),
      // Recovery equipment use per province
      db.execute(sql`
        SELECT province, refrigerant_recovery_equipment_use AS value, COUNT(*)::int AS count
        FROM technicians_survey
        GROUP BY province, refrigerant_recovery_equipment_use
        ORDER BY province, count DESC
      `),
      // EHS barriers per province
      db.execute(sql`
        SELECT province, elem AS value, COUNT(*)::int AS count
        FROM technicians_survey, jsonb_array_elements_text(ehs_compliance_barriers) AS elem
        GROUP BY province, elem
        ORDER BY province, count DESC
      `),
    ]);

  const biggestMap = groupByProvince(biggestChallengeRows.rows as RawCountRow[]);
  const loadSheddingMap = groupByProvince(loadSheddingRows.rows as RawCountRow[]);
  const ppeMap = groupByProvince(ppeRows.rows as RawCountRow[]);
  const recoveryMap = groupByProvince(recoveryRows.rows as RawCountRow[]);
  const ehsMap = groupByProvince(ehsRows.rows as RawCountRow[]);

  return PROVINCES.map((prov) => {
    const provStr = prov as string;
    const challengeRows = biggestMap.get(provStr) ?? [];
    const totalChallenges = challengeRows.reduce((s, r) => s + r.count, 0);
    const topChallenges = challengeRows.slice(0, 5).map((r) => ({
      value: r.value,
      label: BIGGEST_DAILY_CHALLENGE_LABELS[r.value as keyof typeof BIGGEST_DAILY_CHALLENGE_LABELS] ?? r.value,
      count: r.count,
      percent: totalChallenges > 0 ? Number(((r.count / totalChallenges) * 100).toFixed(1)) : 0,
    }));

    const lsRows = loadSheddingMap.get(provStr) ?? [];
    const lsTotal = lsRows.reduce((s, r) => s + r.count, 0);
    const loadSheddingDistribution = lsRows.map((r) => ({
      value: r.value,
      label: LOAD_SHEDDING_FREQUENCY_LABELS[r.value as keyof typeof LOAD_SHEDDING_FREQUENCY_LABELS] ?? r.value,
      count: r.count,
      percent: lsTotal > 0 ? Number(((r.count / lsTotal) * 100).toFixed(1)) : 0,
    }));

    const ppeRowsArr = ppeMap.get(provStr) ?? [];
    const ppeTotal = ppeRowsArr.reduce((s, r) => s + r.count, 0);
    const ppeFullCount = ppeRowsArr.find((r) => r.value === "full_provided");
    const ppeFullAccessPercent =
      ppeTotal > 0 && ppeFullCount
        ? Number(((ppeFullCount.count / ppeTotal) * 100).toFixed(1))
        : 0;

    const recoveryRowsArr = recoveryMap.get(provStr) ?? [];
    const recoveryTotal = recoveryRowsArr.reduce((s, r) => s + r.count, 0);
    const recoveryAlwaysCount = recoveryRowsArr.find((r) => r.value === "always");
    const recoveryAlwaysPercent =
      recoveryTotal > 0 && recoveryAlwaysCount
        ? Number(((recoveryAlwaysCount.count / recoveryTotal) * 100).toFixed(1))
        : 0;

    const ehsRowsArr = ehsMap.get(provStr) ?? [];
    const topEhsBarriers = ehsRowsArr.slice(0, 5).map((r) => ({
      value: r.value,
      label: EHS_BARRIER_LABELS[r.value as keyof typeof EHS_BARRIER_LABELS] ?? r.value,
      count: r.count,
    }));

    return {
      province: prov as Province,
      label: PROVINCE_LABELS[prov as Province] ?? prov,
      totalSubmissions: totalChallenges,
      topChallenges,
      loadSheddingDistribution,
      ppeFullAccessPercent,
      recoveryAlwaysPercent,
      topEhsBarriers,
    };
  }).filter((r) => r.totalSubmissions > 0);
}

function groupByProvince(rows: RawCountRow[]): Map<string, RawCountRow[]> {
  const map = new Map<string, RawCountRow[]>();
  for (const row of rows) {
    const existing = map.get(row.province);
    if (existing) {
      existing.push(row);
    } else {
      map.set(row.province, [row]);
    }
  }
  return map;
}
