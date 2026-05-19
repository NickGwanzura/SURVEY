import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";
import { count, desc, sql } from "drizzle-orm";

export async function getMethodologyData() {
  const [ageGroup, gender, educationLevel, yearsExperience] = await Promise.all([
    db.select({ label: techniciansSurvey.ageGroup, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.ageGroup).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.gender, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.gender).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.educationLevel, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.educationLevel).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.yearsExperience, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.yearsExperience).orderBy(desc(count())),
  ]);
  return { ageGroup, gender, educationLevel, yearsExperience };
}

export async function getSkillsGapData() {
  const [training, certification, confTraditional, confLowGwp] = await Promise.all([
    db.select({ label: techniciansSurvey.hasFormalTraining, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.hasFormalTraining).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.hasCertification, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.hasCertification).orderBy(desc(count())),
    db.select({ label: sql<string>`CAST(${techniciansSurvey.confidenceTraditionalRefrigerants} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.confidenceTraditionalRefrigerants).orderBy(desc(count())),
    db.select({ label: sql<string>`CAST(${techniciansSurvey.confidenceLowGwpRefrigerants} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.confidenceLowGwpRefrigerants).orderBy(desc(count())),
  ]);
  return { training, certification, confTraditional, confLowGwp };
}

export async function getToolsNeedsData() {
  const [tools, parts, lowGwp, recoveryUse, ppe] = await Promise.all([
    db.select({ label: sql<string>`CAST(${techniciansSurvey.accessToTools} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.accessToTools).orderBy(desc(count())),
    db.select({ label: sql<string>`CAST(${techniciansSurvey.accessToSpareParts} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.accessToSpareParts).orderBy(desc(count())),
    db.select({ label: sql<string>`CAST(${techniciansSurvey.accessToLowGwpRefrigerants} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.accessToLowGwpRefrigerants).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.refrigerantRecoveryEquipmentUse, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.refrigerantRecoveryEquipmentUse).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.ppeAccess, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.ppeAccess).orderBy(desc(count())),
  ]);
  return { tools, parts, lowGwp, recoveryUse, ppe };
}

export async function getBarrierAnalysisData() {
  const [dailyChallenges, importCosts, forex, loadShedding] = await Promise.all([
    db.select({ label: techniciansSurvey.biggestDailyChallenge, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.biggestDailyChallenge).orderBy(desc(count())),
    db.select({ label: sql<string>`CAST(${techniciansSurvey.obstacleHighImportCosts} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.obstacleHighImportCosts).orderBy(desc(count())),
    db.select({ label: sql<string>`CAST(${techniciansSurvey.obstacleForexShortages} AS TEXT)`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.obstacleForexShortages).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.loadSheddingFrequency, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.loadSheddingFrequency).orderBy(desc(count())),
  ]);
  return { dailyChallenges, importCosts, forex, loadShedding };
}

export async function getGeoMappingData() {
  const [provinces, cities] = await Promise.all([
    db.select({ label: techniciansSurvey.province, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.province).orderBy(desc(count())),
    db.select({ label: sql<string>`COALESCE(${techniciansSurvey.city}, 'Unknown')`, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.city).orderBy(desc(count())),
  ]);
  return { provinces, cities };
}

export async function getAchievementGapsData() {
  const [energyInstalls, statuses] = await Promise.all([
    db.select({ label: techniciansSurvey.installsEnergyEfficient, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.installsEnergyEfficient).orderBy(desc(count())),
    db.select({ label: techniciansSurvey.status, count: count() }).from(techniciansSurvey).groupBy(techniciansSurvey.status).orderBy(desc(count())),
  ]);
  return { energyInstalls, statuses };
}

export function convertToCsv(data: Record<string, { label: any; count: number }[]>): string {
  const rows: string[] = ["Category,Label,Count"];
  
  for (const [category, items] of Object.entries(data)) {
    for (const item of items) {
      const labelStr = String(item.label).replace(/"/g, '""');
      rows.push(`"${category}","${labelStr}",${item.count}`);
    }
  }
  
  return rows.join("\n");
}
