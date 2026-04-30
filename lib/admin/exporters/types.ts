import type { TechnicianSurvey } from "@/lib/schema";

export type ExportSections = {
  background: boolean;
  skills: boolean;
  tools: boolean;
  challenges: boolean;
  energy: boolean;
  consent: boolean;
};

export type ExportOptions = {
  sections: ExportSections;
  anonymise: boolean;
  includePhotos: boolean;
};

export type ExportResult = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

// ─── Section column definitions ────────────────────────────────────────────

type ColDef = {
  header: string;
  key: keyof TechnicianSurvey;
  section: keyof ExportSections;
  sensitive?: boolean; // omit when anonymise=true
  photo?: boolean;     // omit when includePhotos=false
};

export const ALL_COLUMNS: ColDef[] = [
  // identity (handled separately for anonymise)
  { header: "ID", key: "id", section: "background" },
  { header: "First name", key: "firstName", section: "background", sensitive: true },
  { header: "Surname", key: "surname", section: "background", sensitive: true },

  // background
  { header: "Gender", key: "gender", section: "background" },
  { header: "Age group", key: "ageGroup", section: "background" },
  { header: "Education level", key: "educationLevel", section: "background" },
  { header: "Years experience", key: "yearsExperience", section: "background" },
  { header: "Main work focus", key: "mainWorkFocus", section: "background" },
  { header: "Main work focus (other)", key: "mainWorkFocusOther", section: "background" },
  { header: "Province", key: "province", section: "background" },
  { header: "District", key: "district", section: "background" },
  { header: "City", key: "city", section: "background" },
  { header: "Suburb", key: "suburb", section: "background" },
  { header: "GPS latitude", key: "gpsLatitude", section: "background" },
  { header: "GPS longitude", key: "gpsLongitude", section: "background" },
  { header: "GPS accuracy (m)", key: "gpsAccuracyMeters", section: "background" },
  { header: "Phone", key: "phone", section: "background", sensitive: true },
  { header: "Email", key: "email", section: "background", sensitive: true },

  // skills
  { header: "Has formal training", key: "hasFormalTraining", section: "skills" },
  { header: "Training institution", key: "trainingInstitution", section: "skills" },
  { header: "Training year", key: "trainingYear", section: "skills" },
  { header: "Has certification", key: "hasCertification", section: "skills" },
  { header: "Certifications held", key: "certificationsHeld", section: "skills" },
  { header: "HEVACRAZ member no.", key: "hevacrazMemberNumber", section: "skills" },
  { header: "Confidence: traditional refrigerants", key: "confidenceTraditionalRefrigerants", section: "skills" },
  { header: "Confidence: low-GWP refrigerants", key: "confidenceLowGwpRefrigerants", section: "skills" },

  // tools
  { header: "Access to tools", key: "accessToTools", section: "tools" },
  { header: "Access to spare parts", key: "accessToSpareParts", section: "tools" },
  { header: "Access to low-GWP refrigerants", key: "accessToLowGwpRefrigerants", section: "tools" },

  // challenges
  { header: "Obstacle: high import costs", key: "obstacleHighImportCosts", section: "challenges" },
  { header: "Obstacle: forex shortages", key: "obstacleForexShortages", section: "challenges" },
  { header: "Obstacle: unreliable suppliers", key: "obstacleUnreliableSuppliers", section: "challenges" },
  { header: "Obstacle: counterfeit products", key: "obstacleCounterfeitProducts", section: "challenges" },
  { header: "Obstacles (other)", key: "obstaclesOther", section: "challenges" },
  { header: "Biggest daily challenge", key: "biggestDailyChallenge", section: "challenges" },
  { header: "Biggest daily challenge (other)", key: "biggestDailyChallengeOther", section: "challenges" },
  { header: "Load shedding frequency", key: "loadSheddingFrequency", section: "challenges" },
  { header: "Refrigerant recovery equipment use", key: "refrigerantRecoveryEquipmentUse", section: "challenges" },
  { header: "PPE access", key: "ppeAccess", section: "challenges" },
  { header: "EHS compliance barriers", key: "ehsComplianceBarriers", section: "challenges" },
  { header: "EHS compliance barriers (other)", key: "ehsComplianceBarriersOther", section: "challenges" },

  // energy
  { header: "Installs energy-efficient equipment", key: "installsEnergyEfficient", section: "energy" },
  { header: "Energy-efficient barriers", key: "energyEfficientBarriers", section: "energy" },
  { header: "Energy-efficient barriers (other)", key: "energyEfficientBarriersOther", section: "energy" },

  // consent
  { header: "Consent to contact", key: "consentToContact", section: "consent" },
  { header: "Consent to public registry", key: "consentToPublicRegistry", section: "consent" },
  { header: "Preferred language", key: "preferredLanguage", section: "consent" },
  { header: "Profile photo URL", key: "profilePhotoUrl", section: "consent", photo: true },

  // metadata
  { header: "Status", key: "status", section: "background" },
  { header: "Submitted at", key: "submittedAt", section: "background" },
  { header: "Submission source", key: "submissionSource", section: "background" },
];

export function selectColumns(opts: ExportOptions): ColDef[] {
  return ALL_COLUMNS.filter((col) => {
    if (!opts.sections[col.section]) return false;
    if (col.sensitive && opts.anonymise) return false;
    if (col.photo && !opts.includePhotos) return false;
    return true;
  });
}

export function cellValue(row: TechnicianSurvey, key: keyof TechnicianSurvey): string {
  const val = row[key];
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) return val.join("|");
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

/** Stable 8-char hex hash of a UUID for anonymisation */
export async function stableHash(id: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(id);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
