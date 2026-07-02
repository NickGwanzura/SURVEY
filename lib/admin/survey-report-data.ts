import { count, desc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { AGE_GROUP_LABELS, GENDER_LABELS, YEARS_EXPERIENCE_LABELS } from "@/lib/constants/ageGroups";
import { EDUCATION_LEVEL_LABELS } from "@/lib/constants/educationLevels";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import {
  BIGGEST_DAILY_CHALLENGE_LABELS,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  RECOVERY_EQUIPMENT_USE_LABELS,
  PPE_ACCESS_LABELS,
  ENERGY_EFFICIENT_INSTALL_LABELS,
  EHS_BARRIER_LABELS,
  SUBMISSION_STATUSES,
} from "@/lib/constants/challenges";
import { HAS_CERTIFICATION_LABELS, CERTIFICATION_TYPE_LABELS } from "@/lib/constants/refrigerants";

type CountRow = { label: string; count: number };
type LikertRow = { label: string; count: number; percent: string };

export type SurveyReportRawData = {
  meta: {
    total: number;
    completed: number;
    completionRate: number;
    startDate: Date | null;
    endDate: Date | null;
  };
  demographics: {
    ageGroup: CountRow[];
    gender: CountRow[];
    educationLevel: CountRow[];
    yearsExperience: CountRow[];
  };
  location: {
    province: CountRow[];
  };
  skills: {
    mainWorkFocus: CountRow[];
    hasFormalTraining: CountRow[];
    hasCertification: CountRow[];
    certificationsHeld: CountRow[];
    confidenceTraditional: LikertRow[];
    confidenceLowGwp: LikertRow[];
  };
  trainingNeeds: {
    missingCertifications: CountRow[];
    trainingByProvince: Array<{ province: string; noFormalTraining: number; total: number; rate: number }>;
    certificationByProvince: Array<{ province: string; certified: number; total: number; rate: number }>;
    ppeAccessByProvince: Array<{ province: string; noPpe: number; total: number; rate: number }>;
  };
  tools: {
    accessToTools: LikertRow[];
    accessToSpareParts: LikertRow[];
    accessToLowGwpRefrigerants: LikertRow[];
    recoveryEquipmentUse: CountRow[];
    ppeAccess: CountRow[];
  };
  employment: {
    byStatus: CountRow[];
    consentToContact: CountRow[];
    consentToRegistry: CountRow[];
  };
  safety: {
    ppeAccess: CountRow[];
    ehsBarriers: CountRow[];
    recoveryEquipmentUse: CountRow[];
  };
  challenges: {
    biggestDailyChallenge: CountRow[];
    loadSheddingFrequency: CountRow[];
    obstacleHighImportCosts: LikertRow[];
    obstacleForexShortages: LikertRow[];
    obstacleUnreliableSuppliers: LikertRow[];
    obstacleCounterfeitProducts: LikertRow[];
    ehsBarriers: CountRow[];
    energyEfficientBarriers: CountRow[];
  };
  energy: {
    installsEnergyEfficient: CountRow[];
  };
};

function labelize(key: string, rows: CountRow[]): CountRow[] {
  const labelMaps: Record<string, Record<string, string>> = {
    ageGroup: AGE_GROUP_LABELS,
    gender: GENDER_LABELS,
    educationLevel: EDUCATION_LEVEL_LABELS,
    yearsExperience: YEARS_EXPERIENCE_LABELS,
    province: PROVINCE_LABELS,
    mainWorkFocus: MAIN_WORK_FOCUS_LABELS,
    hasFormalTraining: { true: "Yes", false: "No" },
    hasCertification: HAS_CERTIFICATION_LABELS,
    certificationType: CERTIFICATION_TYPE_LABELS,
    biggestDailyChallenge: BIGGEST_DAILY_CHALLENGE_LABELS,
    loadSheddingFrequency: LOAD_SHEDDING_FREQUENCY_LABELS,
    recoveryEquipmentUse: RECOVERY_EQUIPMENT_USE_LABELS,
    ppeAccess: PPE_ACCESS_LABELS,
    energyEfficientInstall: ENERGY_EFFICIENT_INSTALL_LABELS,
    ehsBarrier: EHS_BARRIER_LABELS,
  };
  const map = labelMaps[key];
  if (!map) return rows;
  return rows.map((r) => ({
    ...r,
    label: map[r.label] ?? r.label.replace(/_/g, " "),
  }));
}

function computePercent(rows: CountRow[], total: number): (CountRow & { percent: string })[] {
  return rows.map((r) => ({
    ...r,
    percent: total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0",
  }));
}

function likertBuckets(
  rows: { label: string; count: number }[],
): { label: string; count: number; percent: string }[] {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const buckets: Record<string, { count: number }> = {
    "1": { count: 0 },
    "2": { count: 0 },
    "3": { count: 0 },
    "4": { count: 0 },
    "5": { count: 0 },
  };
  for (const r of rows) {
    const key = String(r.label);
    if (buckets[key]) buckets[key].count = r.count;
  }
  return Object.entries(buckets).map(([label, data]) => ({
    label: `Level ${label}`,
    count: data.count,
    percent: total > 0 ? ((data.count / total) * 100).toFixed(1) : "0.0",
  }));
}

export async function getSurveyReportData(
  startDate?: Date,
  endDate?: Date,
): Promise<SurveyReportRawData> {
  const dateFilter = startDate && endDate
    ? sql`${techniciansSurvey.submittedAt} >= ${startDate} AND ${techniciansSurvey.submittedAt} <= ${endDate}`
    : sql`1=1`;

  const allRows = await db
    .select({
      ageGroup: techniciansSurvey.ageGroup,
      gender: techniciansSurvey.gender,
      educationLevel: techniciansSurvey.educationLevel,
      yearsExperience: techniciansSurvey.yearsExperience,
      province: techniciansSurvey.province,
      mainWorkFocus: techniciansSurvey.mainWorkFocus,
      hasFormalTraining: techniciansSurvey.hasFormalTraining,
      hasCertification: techniciansSurvey.hasCertification,
      certificationsHeld: techniciansSurvey.certificationsHeld,
      confidenceTraditional: techniciansSurvey.confidenceTraditionalRefrigerants,
      confidenceLowGwp: techniciansSurvey.confidenceLowGwpRefrigerants,
      accessToTools: techniciansSurvey.accessToTools,
      accessToSpareParts: techniciansSurvey.accessToSpareParts,
      accessToLowGwpRefrigerants: techniciansSurvey.accessToLowGwpRefrigerants,
      recoveryEquipmentUse: techniciansSurvey.refrigerantRecoveryEquipmentUse,
      ppeAccess: techniciansSurvey.ppeAccess,
      biggestDailyChallenge: techniciansSurvey.biggestDailyChallenge,
      loadSheddingFrequency: techniciansSurvey.loadSheddingFrequency,
      obstacleHighImportCosts: techniciansSurvey.obstacleHighImportCosts,
      obstacleForexShortages: techniciansSurvey.obstacleForexShortages,
      obstacleUnreliableSuppliers: techniciansSurvey.obstacleUnreliableSuppliers,
      obstacleCounterfeitProducts: techniciansSurvey.obstacleCounterfeitProducts,
      ehsComplianceBarriers: techniciansSurvey.ehsComplianceBarriers,
      installsEnergyEfficient: techniciansSurvey.installsEnergyEfficient,
      energyEfficientBarriers: techniciansSurvey.energyEfficientBarriers,
      consentToContact: techniciansSurvey.consentToContact,
      consentToPublicRegistry: techniciansSurvey.consentToPublicRegistry,
      status: techniciansSurvey.status,
      submittedAt: techniciansSurvey.submittedAt,
    })
    .from(techniciansSurvey)
    .where(
      startDate && endDate
        ? sql`${techniciansSurvey.submittedAt} >= ${startDate} AND ${techniciansSurvey.submittedAt} <= ${endDate}`
        : undefined,
    );

  const total = allRows.length;
  const completed = allRows.filter((r) => r.status !== "pending").length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const dates = allRows.map((r) => r.submittedAt).filter(Boolean) as Date[];
  const startDateActual = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const endDateActual = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

  function countRows(field: keyof typeof allRows[number]): CountRow[] {
    const map = new Map<string, number>();
    for (const row of allRows) {
      const val = String(row[field] ?? "unknown");
      map.set(val, (map.get(val) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  function countJsonArray(field: keyof typeof allRows[number]): CountRow[] {
    const map = new Map<string, number>();
    for (const row of allRows) {
      const arr = row[field];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          const val = String(item);
          map.set(val, (map.get(val) ?? 0) + 1);
        }
      }
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  const mainWorkFocusRaw = countJsonArray("mainWorkFocus");
  const certificationsHeldRaw = countJsonArray("certificationsHeld");
  const ehsBarriersRaw = countJsonArray("ehsComplianceBarriers");
  const energyBarriersRaw = countJsonArray("energyEfficientBarriers");

  const provinces = countRows("province");

  const provStatsRaw = new Map<string, {
    total: number; noTraining: number; certified: number; noPpe: number;
  }>();
  for (const row of allRows) {
    const prov = String(row.province);
    if (!provStatsRaw.has(prov)) {
      provStatsRaw.set(prov, { total: 0, noTraining: 0, certified: 0, noPpe: 0 });
    }
    const entry = provStatsRaw.get(prov)!;
    entry.total++;
    if (!row.hasFormalTraining) entry.noTraining++;
    if (row.hasCertification === "yes") entry.certified++;
    if (row.ppeAccess === "none") entry.noPpe++;
  }
  const trainingByProvince = Array.from(provStatsRaw.entries()).map(
    ([province, data]) => ({
      province: PROVINCE_LABELS[province as keyof typeof PROVINCE_LABELS] ?? province,
      noFormalTraining: data.noTraining,
      total: data.total,
      rate: data.total > 0 ? (data.noTraining / data.total) * 100 : 0,
    }),
  );
  const certificationByProvince = Array.from(provStatsRaw.entries()).map(
    ([province, data]) => ({
      province: PROVINCE_LABELS[province as keyof typeof PROVINCE_LABELS] ?? province,
      certified: data.certified,
      total: data.total,
      rate: data.total > 0 ? (data.certified / data.total) * 100 : 0,
    }),
  );
  const ppeAccessByProvince = Array.from(provStatsRaw.entries()).map(
    ([province, data]) => ({
      province: PROVINCE_LABELS[province as keyof typeof PROVINCE_LABELS] ?? province,
      noPpe: data.noPpe,
      total: data.total,
      rate: data.total > 0 ? (data.noPpe / data.total) * 100 : 0,
    }),
  );

  return {
    meta: {
      total,
      completed,
      completionRate,
      startDate: startDateActual,
      endDate: endDateActual,
    },
    demographics: {
      ageGroup: labelize("ageGroup", countRows("ageGroup")),
      gender: labelize("gender", countRows("gender")),
      educationLevel: labelize("educationLevel", countRows("educationLevel")),
      yearsExperience: labelize("yearsExperience", countRows("yearsExperience")),
    },
    location: {
      province: labelize("province", provinces),
    },
    skills: {
      mainWorkFocus: labelize("mainWorkFocus", mainWorkFocusRaw),
      hasFormalTraining: labelize("hasFormalTraining", countRows("hasFormalTraining")),
      hasCertification: labelize("hasCertification", countRows("hasCertification")),
      certificationsHeld: labelize("certificationType", certificationsHeldRaw),
      confidenceTraditional: likertBuckets(countRows("confidenceTraditional")),
      confidenceLowGwp: likertBuckets(countRows("confidenceLowGwp")),
    },
    trainingNeeds: {
      missingCertifications: labelize("hasCertification", countRows("hasCertification")),
      trainingByProvince,
      certificationByProvince,
      ppeAccessByProvince,
    },
    tools: {
      accessToTools: likertBuckets(countRows("accessToTools")),
      accessToSpareParts: likertBuckets(countRows("accessToSpareParts")),
      accessToLowGwpRefrigerants: likertBuckets(countRows("accessToLowGwpRefrigerants")),
      recoveryEquipmentUse: labelize("recoveryEquipmentUse", countRows("recoveryEquipmentUse")),
      ppeAccess: labelize("ppeAccess", countRows("ppeAccess")),
    },
    employment: {
      byStatus: countRows("status"),
      consentToContact: labelize("hasFormalTraining", countRows("consentToContact")),
      consentToRegistry: labelize("hasFormalTraining", countRows("consentToPublicRegistry")),
    },
    safety: {
      ppeAccess: labelize("ppeAccess", countRows("ppeAccess")),
      ehsBarriers: labelize("ehsBarrier", ehsBarriersRaw),
      recoveryEquipmentUse: labelize("recoveryEquipmentUse", countRows("recoveryEquipmentUse")),
    },
    challenges: {
      biggestDailyChallenge: labelize("biggestDailyChallenge", countRows("biggestDailyChallenge")),
      loadSheddingFrequency: labelize("loadSheddingFrequency", countRows("loadSheddingFrequency")),
      obstacleHighImportCosts: likertBuckets(countRows("obstacleHighImportCosts")),
      obstacleForexShortages: likertBuckets(countRows("obstacleForexShortages")),
      obstacleUnreliableSuppliers: likertBuckets(countRows("obstacleUnreliableSuppliers")),
      obstacleCounterfeitProducts: likertBuckets(countRows("obstacleCounterfeitProducts")),
      ehsBarriers: labelize("ehsBarrier", ehsBarriersRaw),
      energyEfficientBarriers: labelize("ehsBarrier", energyBarriersRaw),
    },
    energy: {
      installsEnergyEfficient: labelize("energyEfficientInstall", countRows("installsEnergyEfficient")),
    },
  };
}
