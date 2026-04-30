import { count, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { PROVINCE_LABELS, PROVINCES } from "@/lib/constants/provinces";
import { EDUCATION_LEVEL_LABELS } from "@/lib/constants/educationLevels";
import {
  EHS_BARRIER_LABELS,
  ENERGY_EFFICIENT_BARRIER_LABELS,
  BIGGEST_DAILY_CHALLENGE_LABELS,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  RECOVERY_EQUIPMENT_USE_LABELS,
  PPE_ACCESS_LABELS,
  ENERGY_EFFICIENT_INSTALL_LABELS,
} from "@/lib/constants/challenges";
import { techniciansSurvey } from "@/lib/schema";
import type { Province } from "@/lib/constants/provinces";

type ValueCountRow = { value: string; count: number };
type ProvValueCountRow = { province: string; value: string; count: number };

export type InsightsData = {
  skills: {
    avgConfidenceTraditional: number;
    avgConfidenceLowGwp: number;
    confidenceGapByProvince: Array<{
      province: Province;
      label: string;
      traditional: number;
      lowGwp: number;
      gap: number;
    }>;
    certificationRateByProvince: Array<{
      province: Province;
      label: string;
      certifiedPercent: number;
    }>;
    educationDistribution: Array<{
      value: string;
      label: string;
      count: number;
      percent: number;
    }>;
  };
  resources: {
    obstacleMeans: {
      importCosts: number;
      forexShortages: number;
      unreliableSuppliers: number;
      counterfeit: number;
    };
    topObstaclesByProvince: Array<{
      province: Province;
      label: string;
      top: Array<{ name: string; mean: number }>;
    }>;
    accessMeans: {
      tools: number;
      spareParts: number;
      lowGwpRefrigerants: number;
    };
  };
  challenges: {
    biggestChallenge: Array<{ value: string; label: string; count: number }>;
    biggestChallengeByProvince: Array<{
      province: Province;
      label: string;
      top: { value: string; label: string; count: number };
    }>;
    loadSheddingDistribution: Array<{
      value: string;
      label: string;
      count: number;
      percent: number;
    }>;
    recoveryEquipmentUseRate: Array<{
      value: string;
      label: string;
      count: number;
      percent: number;
    }>;
    ppeAccessDistribution: Array<{
      value: string;
      label: string;
      count: number;
      percent: number;
    }>;
    topEhsBarriers: Array<{ value: string; label: string; count: number }>;
  };
  energy: {
    energyEfficientInstallRate: Array<{
      value: string;
      label: string;
      count: number;
      percent: number;
    }>;
    topEnergyEfficientBarriers: Array<{
      value: string;
      label: string;
      count: number;
    }>;
    correlationTrainingVsEfficient: Array<{
      trained: boolean;
      alwaysInstalls: boolean;
      count: number;
    }>;
  };
  meta: { generatedAt: string; sampleSize: number };
};

const EMPTY_INSIGHTS: InsightsData = {
  skills: {
    avgConfidenceTraditional: 0,
    avgConfidenceLowGwp: 0,
    confidenceGapByProvince: [],
    certificationRateByProvince: [],
    educationDistribution: [],
  },
  resources: {
    obstacleMeans: {
      importCosts: 0,
      forexShortages: 0,
      unreliableSuppliers: 0,
      counterfeit: 0,
    },
    topObstaclesByProvince: [],
    accessMeans: { tools: 0, spareParts: 0, lowGwpRefrigerants: 0 },
  },
  challenges: {
    biggestChallenge: [],
    biggestChallengeByProvince: [],
    loadSheddingDistribution: [],
    recoveryEquipmentUseRate: [],
    ppeAccessDistribution: [],
    topEhsBarriers: [],
  },
  energy: {
    energyEfficientInstallRate: [],
    topEnergyEfficientBarriers: [],
    correlationTrainingVsEfficient: [],
  },
  meta: { generatedAt: new Date().toISOString(), sampleSize: 0 },
};

export async function getInsightsData(): Promise<InsightsData> {
  const sampleResult = await db
    .select({ count: count() })
    .from(techniciansSurvey);
  const sampleSize = sampleResult[0]?.count ?? 0;

  if (sampleSize === 0) {
    return EMPTY_INSIGHTS;
  }

  const [
    natConfRows,
    confByProvinceRows,
    certByProvinceRows,
    educationRows,
    obstacleMeansRows,
    obstacleByProvinceRows,
    accessMeansRows,
    biggestChallengeRows,
    biggestChallengeByProvinceRows,
    loadSheddingRows,
    recoveryEquipmentRows,
    ppeAccessRows,
    ehsBarrierRows,
    installRateRows,
    energyBarrierRows,
    correlationRows,
  ] = await Promise.all([
    db.execute(sql`
      SELECT
        AVG(confidence_traditional_refrigerants)::float AS avg_traditional,
        AVG(confidence_low_gwp_refrigerants)::float AS avg_low_gwp
      FROM technicians_survey
    `),
    db.execute(sql`
      SELECT
        province,
        AVG(confidence_traditional_refrigerants)::float AS trad_prov,
        AVG(confidence_low_gwp_refrigerants)::float AS low_gwp_prov
      FROM technicians_survey
      GROUP BY province
    `),
    db.execute(sql`
      SELECT
        province,
        COUNT(*) FILTER (WHERE has_certification = 'yes')::float / COUNT(*)::float * 100 AS certified_percent
      FROM technicians_survey
      GROUP BY province
    `),
    db.execute(sql`
      SELECT education_level AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY education_level
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT
        AVG(obstacle_high_import_costs)::float AS import_costs,
        AVG(obstacle_forex_shortages)::float AS forex_shortages,
        AVG(obstacle_unreliable_suppliers)::float AS unreliable_suppliers,
        AVG(obstacle_counterfeit_products)::float AS counterfeit
      FROM technicians_survey
    `),
    db.execute(sql`
      SELECT
        province,
        AVG(obstacle_high_import_costs)::float AS import_costs,
        AVG(obstacle_forex_shortages)::float AS forex_shortages,
        AVG(obstacle_unreliable_suppliers)::float AS unreliable_suppliers,
        AVG(obstacle_counterfeit_products)::float AS counterfeit
      FROM technicians_survey
      GROUP BY province
    `),
    db.execute(sql`
      SELECT
        AVG(access_to_tools)::float AS tools,
        AVG(access_to_spare_parts)::float AS spare_parts,
        AVG(access_to_low_gwp_refrigerants)::float AS low_gwp_refrigerants
      FROM technicians_survey
    `),
    db.execute(sql`
      SELECT biggest_daily_challenge AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY biggest_daily_challenge
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT province, biggest_daily_challenge AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY province, biggest_daily_challenge
    `),
    db.execute(sql`
      SELECT load_shedding_frequency AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY load_shedding_frequency
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT refrigerant_recovery_equipment_use AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY refrigerant_recovery_equipment_use
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT ppe_access AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY ppe_access
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT elem AS value, COUNT(*)::int AS count
      FROM technicians_survey, jsonb_array_elements_text(ehs_compliance_barriers) AS elem
      GROUP BY elem
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT installs_energy_efficient AS value, COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY installs_energy_efficient
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT elem AS value, COUNT(*)::int AS count
      FROM technicians_survey, jsonb_array_elements_text(energy_efficient_barriers) AS elem
      GROUP BY elem
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT
        has_formal_training AS trained,
        (installs_energy_efficient = 'always') AS always_installs,
        COUNT(*)::int AS count
      FROM technicians_survey
      GROUP BY has_formal_training, (installs_energy_efficient = 'always')
    `),
  ]);

  // --- Skills ---
  type NatConfRow = {
    avg_traditional: number | null;
    avg_low_gwp: number | null;
  };
  const nc = natConfRows.rows[0] as NatConfRow;
  const avgConfidenceTraditional = Number(
    (nc?.avg_traditional ?? 0).toFixed(2),
  );
  const avgConfidenceLowGwp = Number((nc?.avg_low_gwp ?? 0).toFixed(2));

  type ConfProvRow = {
    province: string;
    trad_prov: number | null;
    low_gwp_prov: number | null;
  };
  const confidenceGapByProvince = (confByProvinceRows.rows as ConfProvRow[])
    .map((r) => {
      const trad = Number((r.trad_prov ?? 0).toFixed(2));
      const lowGwp = Number((r.low_gwp_prov ?? 0).toFixed(2));
      return {
        province: r.province as Province,
        label: PROVINCE_LABELS[r.province as Province] ?? r.province,
        traditional: trad,
        lowGwp,
        gap: Number((trad - lowGwp).toFixed(2)),
      };
    })
    .sort((a, b) => b.gap - a.gap);

  type CertProvRow = { province: string; certified_percent: number | null };
  const certificationRateByProvince = (
    certByProvinceRows.rows as CertProvRow[]
  ).map((r) => ({
    province: r.province as Province,
    label: PROVINCE_LABELS[r.province as Province] ?? r.province,
    certifiedPercent: Number((r.certified_percent ?? 0).toFixed(1)),
  }));

  const totalEdu = (educationRows.rows as ValueCountRow[]).reduce(
    (s, r) => s + r.count,
    0,
  );
  const educationDistribution = (educationRows.rows as ValueCountRow[]).map(
    (r) => ({
      value: r.value,
      label:
        EDUCATION_LEVEL_LABELS[
          r.value as keyof typeof EDUCATION_LEVEL_LABELS
        ] ?? r.value,
      count: r.count,
      percent:
        totalEdu > 0
          ? Number(((r.count / totalEdu) * 100).toFixed(1))
          : 0,
    }),
  );

  // --- Resources ---
  type ObsMeansRow = {
    import_costs: number | null;
    forex_shortages: number | null;
    unreliable_suppliers: number | null;
    counterfeit: number | null;
  };
  const om = obstacleMeansRows.rows[0] as ObsMeansRow;
  const obstacleMeans = {
    importCosts: Number((om?.import_costs ?? 0).toFixed(2)),
    forexShortages: Number((om?.forex_shortages ?? 0).toFixed(2)),
    unreliableSuppliers: Number((om?.unreliable_suppliers ?? 0).toFixed(2)),
    counterfeit: Number((om?.counterfeit ?? 0).toFixed(2)),
  };

  type ObsProvRow = {
    province: string;
    import_costs: number | null;
    forex_shortages: number | null;
    unreliable_suppliers: number | null;
    counterfeit: number | null;
  };
  const obstacleKeys = [
    { key: "import_costs" as const, name: "Import Costs" },
    { key: "forex_shortages" as const, name: "Forex Shortages" },
    { key: "unreliable_suppliers" as const, name: "Unreliable Suppliers" },
    { key: "counterfeit" as const, name: "Counterfeit Products" },
  ];
  const topObstaclesByProvince = (
    obstacleByProvinceRows.rows as ObsProvRow[]
  ).map((r) => {
    const scores = obstacleKeys.map((k) => ({
      name: k.name,
      mean: Number(((r[k.key] ?? 0) as number).toFixed(2)),
    }));
    scores.sort((a, b) => b.mean - a.mean);
    return {
      province: r.province as Province,
      label: PROVINCE_LABELS[r.province as Province] ?? r.province,
      top: scores.slice(0, 3),
    };
  });

  type AccessRow = {
    tools: number | null;
    spare_parts: number | null;
    low_gwp_refrigerants: number | null;
  };
  const ac = accessMeansRows.rows[0] as AccessRow;
  const accessMeans = {
    tools: Number((ac?.tools ?? 0).toFixed(2)),
    spareParts: Number((ac?.spare_parts ?? 0).toFixed(2)),
    lowGwpRefrigerants: Number((ac?.low_gwp_refrigerants ?? 0).toFixed(2)),
  };

  // --- Challenges ---
  const biggestChallenge = (biggestChallengeRows.rows as ValueCountRow[]).map(
    (r) => ({
      value: r.value,
      label:
        BIGGEST_DAILY_CHALLENGE_LABELS[
          r.value as keyof typeof BIGGEST_DAILY_CHALLENGE_LABELS
        ] ?? r.value,
      count: r.count,
    }),
  );

  const bcProvMap = new Map<string, Array<{ value: string; count: number }>>();
  for (const r of biggestChallengeByProvinceRows.rows as ProvValueCountRow[]) {
    if (!bcProvMap.has(r.province)) bcProvMap.set(r.province, []);
    bcProvMap.get(r.province)!.push({ value: r.value, count: r.count });
  }
  const biggestChallengeByProvince = PROVINCES.flatMap((prov) => {
    const rows = bcProvMap.get(prov) ?? [];
    rows.sort((a, b) => b.count - a.count);
    const top = rows[0];
    if (!top) return [];
    return [
      {
        province: prov as Province,
        label: PROVINCE_LABELS[prov as Province],
        top: {
          value: top.value,
          label:
            BIGGEST_DAILY_CHALLENGE_LABELS[
              top.value as keyof typeof BIGGEST_DAILY_CHALLENGE_LABELS
            ] ?? top.value,
          count: top.count,
        },
      },
    ];
  });

  const lsTotal = (loadSheddingRows.rows as ValueCountRow[]).reduce(
    (s, r) => s + r.count,
    0,
  );
  const loadSheddingDistribution = (
    loadSheddingRows.rows as ValueCountRow[]
  ).map((r) => ({
    value: r.value,
    label:
      LOAD_SHEDDING_FREQUENCY_LABELS[
        r.value as keyof typeof LOAD_SHEDDING_FREQUENCY_LABELS
      ] ?? r.value,
    count: r.count,
    percent:
      lsTotal > 0 ? Number(((r.count / lsTotal) * 100).toFixed(1)) : 0,
  }));

  const reuTotal = (recoveryEquipmentRows.rows as ValueCountRow[]).reduce(
    (s, r) => s + r.count,
    0,
  );
  const recoveryEquipmentUseRate = (
    recoveryEquipmentRows.rows as ValueCountRow[]
  ).map((r) => ({
    value: r.value,
    label:
      RECOVERY_EQUIPMENT_USE_LABELS[
        r.value as keyof typeof RECOVERY_EQUIPMENT_USE_LABELS
      ] ?? r.value,
    count: r.count,
    percent:
      reuTotal > 0 ? Number(((r.count / reuTotal) * 100).toFixed(1)) : 0,
  }));

  const ppeTotal = (ppeAccessRows.rows as ValueCountRow[]).reduce(
    (s, r) => s + r.count,
    0,
  );
  const ppeAccessDistribution = (ppeAccessRows.rows as ValueCountRow[]).map(
    (r) => ({
      value: r.value,
      label:
        PPE_ACCESS_LABELS[r.value as keyof typeof PPE_ACCESS_LABELS] ??
        r.value,
      count: r.count,
      percent:
        ppeTotal > 0 ? Number(((r.count / ppeTotal) * 100).toFixed(1)) : 0,
    }),
  );

  const topEhsBarriers = (ehsBarrierRows.rows as ValueCountRow[]).map((r) => ({
    value: r.value,
    label:
      EHS_BARRIER_LABELS[r.value as keyof typeof EHS_BARRIER_LABELS] ??
      r.value,
    count: r.count,
  }));

  // --- Energy ---
  const installTotal = (installRateRows.rows as ValueCountRow[]).reduce(
    (s, r) => s + r.count,
    0,
  );
  const energyEfficientInstallRate = (
    installRateRows.rows as ValueCountRow[]
  ).map((r) => ({
    value: r.value,
    label:
      ENERGY_EFFICIENT_INSTALL_LABELS[
        r.value as keyof typeof ENERGY_EFFICIENT_INSTALL_LABELS
      ] ?? r.value,
    count: r.count,
    percent:
      installTotal > 0
        ? Number(((r.count / installTotal) * 100).toFixed(1))
        : 0,
  }));

  const topEnergyEfficientBarriers = (
    energyBarrierRows.rows as ValueCountRow[]
  ).map((r) => ({
    value: r.value,
    label:
      ENERGY_EFFICIENT_BARRIER_LABELS[
        r.value as keyof typeof ENERGY_EFFICIENT_BARRIER_LABELS
      ] ?? r.value,
    count: r.count,
  }));

  type CorrRow = {
    trained: boolean;
    always_installs: boolean;
    count: number;
  };
  const correlationTrainingVsEfficient = (
    correlationRows.rows as CorrRow[]
  ).map((r) => ({
    trained: r.trained,
    alwaysInstalls: r.always_installs,
    count: r.count,
  }));

  return {
    skills: {
      avgConfidenceTraditional,
      avgConfidenceLowGwp,
      confidenceGapByProvince,
      certificationRateByProvince,
      educationDistribution,
    },
    resources: {
      obstacleMeans,
      topObstaclesByProvince,
      accessMeans,
    },
    challenges: {
      biggestChallenge,
      biggestChallengeByProvince,
      loadSheddingDistribution,
      recoveryEquipmentUseRate,
      ppeAccessDistribution,
      topEhsBarriers,
    },
    energy: {
      energyEfficientInstallRate,
      topEnergyEfficientBarriers,
      correlationTrainingVsEfficient,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      sampleSize,
    },
  };
}
