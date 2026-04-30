import type { TechnicianSurvey } from "@/lib/schema";
import { stableHash, type ExportOptions, type ExportResult } from "./types";

// ─── SPSS numeric coding maps ────────────────────────────────────────────────
// SPSS-CSV uses numeric codes. The codebook is embedded as a label row (row 2).

const GENDER_CODES: Record<string, number> = {
  male: 1,
  female: 2,
  prefer_not_to_say: 99,
};

const AGE_GROUP_CODES: Record<string, number> = {
  under_25: 1,
  "25_34": 2,
  "35_44": 3,
  "45_54": 4,
  "55_64": 5,
  "65_plus": 6,
};

const EDUCATION_CODES: Record<string, number> = {
  none: 1,
  primary: 2,
  o_level: 3,
  a_level: 4,
  vocational: 5,
  diploma: 6,
  degree: 7,
  postgraduate: 8,
};

const YEARS_EXP_CODES: Record<string, number> = {
  less_than_1: 1,
  "1_3": 2,
  "4_6": 3,
  "7_10": 4,
  "11_15": 5,
  "16_20": 6,
  more_than_20: 7,
};

const WORK_FOCUS_CODES: Record<string, number> = {
  domestic_ac: 1,
  commercial_ac: 2,
  industrial_refrigeration: 3,
  commercial_refrigeration: 4,
  mobile_ac: 5,
  heat_pumps: 6,
  cold_chain: 7,
  general_hvacr: 8,
  other: 99,
};

const PROVINCE_CODES: Record<string, number> = {
  bulawayo: 1,
  harare: 2,
  manicaland: 3,
  mashonaland_central: 4,
  mashonaland_east: 5,
  mashonaland_west: 6,
  masvingo: 7,
  matabeleland_north: 8,
  matabeleland_south: 9,
  midlands: 10,
};

const CERTIFICATION_CODES: Record<string, number> = {
  yes: 1,
  no: 2,
  studying: 3,
};

const CHALLENGE_CODES: Record<string, number> = {
  power_outages: 1,
  forex_shortages: 2,
  spare_parts: 3,
  counterfeit: 4,
  unsafe_conditions: 5,
  customer_payment: 6,
  training_opportunities: 7,
  certification_access: 8,
  transport_mobility: 9,
  unqualified_competition: 10,
  other: 99,
};

const LOAD_SHEDDING_CODES: Record<string, number> = {
  never: 1,
  rarely: 2,
  occasionally: 3,
  frequently: 4,
  daily: 5,
};

const RECOVERY_CODES: Record<string, number> = {
  always: 1,
  sometimes: 2,
  rarely: 3,
  never: 4,
  no_access: 5,
};

const PPE_CODES: Record<string, number> = {
  full_provided: 1,
  partial_provided: 2,
  self_provided: 3,
  none: 4,
};

const ENERGY_INSTALL_CODES: Record<string, number> = {
  always: 1,
  on_request: 2,
  sometimes: 3,
  rarely: 4,
  never: 5,
};

const LANG_CODES: Record<string, number> = {
  english: 1,
  shona: 2,
  ndebele: 3,
};

const STATUS_CODES: Record<string, number> = {
  pending: 1,
  verified: 2,
  flagged: 3,
  duplicate: 4,
};

// ─── Column definitions ──────────────────────────────────────────────────────

type SpssCol = {
  name: string; // ≤8 char variable name
  label: string; // human-readable for label row
  getValue: (row: TechnicianSurvey, anon: boolean) => string | number;
};

const SPSS_COLUMNS: SpssCol[] = [
  {
    name: "id",
    label: "Respondent ID",
    getValue: (row, anon) => (anon ? "__HASH__" + row.id : row.id),
  },
  { name: "province", label: "Province (1=Byo,2=Hre,...,10=Mids)", getValue: (r) => PROVINCE_CODES[r.province] ?? 99 },
  { name: "district", label: "District", getValue: (r) => r.district },
  { name: "gender", label: "Gender (1=M,2=F,99=NR)", getValue: (r) => GENDER_CODES[r.gender] ?? 99 },
  { name: "age_grp", label: "Age group (1=<25...6=65+)", getValue: (r) => AGE_GROUP_CODES[r.ageGroup] ?? 99 },
  { name: "edu_lvl", label: "Education level (1-8)", getValue: (r) => EDUCATION_CODES[r.educationLevel] ?? 99 },
  { name: "yrs_exp", label: "Years experience (1=<1...7=>20)", getValue: (r) => YEARS_EXP_CODES[r.yearsExperience] ?? 99 },
  { name: "wk_focus", label: "Work focus (1-8,99=other)", getValue: (r) => WORK_FOCUS_CODES[r.mainWorkFocus] ?? 99 },
  { name: "has_cert", label: "Has certification (1=yes,2=no,3=studying)", getValue: (r) => CERTIFICATION_CODES[r.hasCertification] ?? 99 },
  { name: "gps_lat", label: "GPS latitude", getValue: (r) => r.gpsLatitude != null ? String(r.gpsLatitude) : "" },
  { name: "gps_lng", label: "GPS longitude", getValue: (r) => r.gpsLongitude != null ? String(r.gpsLongitude) : "" },
  { name: "conf_tr", label: "Confidence traditional refrigerants (1-5)", getValue: (r) => r.confidenceTraditionalRefrigerants },
  { name: "conf_lg", label: "Confidence low-GWP refrigerants (1-5)", getValue: (r) => r.confidenceLowGwpRefrigerants },
  { name: "acc_tls", label: "Access to tools (1-5)", getValue: (r) => r.accessToTools },
  { name: "acc_pts", label: "Access to spare parts (1-5)", getValue: (r) => r.accessToSpareParts },
  { name: "acc_lgw", label: "Access low-GWP refrig. (1-5)", getValue: (r) => r.accessToLowGwpRefrigerants },
  { name: "obs_imp", label: "Obstacle: high import costs (1-5)", getValue: (r) => r.obstacleHighImportCosts },
  { name: "obs_fx", label: "Obstacle: forex shortages (1-5)", getValue: (r) => r.obstacleForexShortages },
  { name: "obs_sup", label: "Obstacle: unreliable suppliers (1-5)", getValue: (r) => r.obstacleUnreliableSuppliers },
  { name: "obs_cnt", label: "Obstacle: counterfeit products (1-5)", getValue: (r) => r.obstacleCounterfeitProducts },
  { name: "bg_chal", label: "Biggest daily challenge (codes)", getValue: (r) => CHALLENGE_CODES[r.biggestDailyChallenge] ?? 99 },
  { name: "ld_shdg", label: "Load shedding frequency (1=never...5=daily)", getValue: (r) => LOAD_SHEDDING_CODES[r.loadSheddingFrequency] ?? 99 },
  { name: "rec_eq", label: "Recovery equipment use (1=always...5=no_acc)", getValue: (r) => RECOVERY_CODES[r.refrigerantRecoveryEquipmentUse] ?? 99 },
  { name: "ppe_acc", label: "PPE access (1=full...4=none)", getValue: (r) => PPE_CODES[r.ppeAccess] ?? 99 },
  { name: "ee_inst", label: "EE installs (1=always...5=never)", getValue: (r) => ENERGY_INSTALL_CODES[r.installsEnergyEfficient] ?? 99 },
  { name: "lang", label: "Preferred language (1=en,2=sn,3=nd)", getValue: (r) => LANG_CODES[r.preferredLanguage] ?? 99 },
  { name: "cns_ctc", label: "Consent to contact (1=yes,0=no)", getValue: (r) => r.consentToContact ? 1 : 0 },
  { name: "cns_pub", label: "Consent to public registry (1=yes,0=no)", getValue: (r) => r.consentToPublicRegistry ? 1 : 0 },
  { name: "status", label: "Submission status (1=pend,2=verif,3=flag,4=dup)", getValue: (r) => STATUS_CODES[r.status] ?? 99 },
  { name: "sub_at", label: "Submitted at (ISO 8601)", getValue: (r) => r.submittedAt instanceof Date ? r.submittedAt.toISOString() : String(r.submittedAt) },
];

function escapeCsvCell(val: string | number): string {
  const s = String(val);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function spssExporter(
  rows: TechnicianSurvey[],
  opts: ExportOptions,
): Promise<ExportResult> {
  const anon = opts.anonymise;

  // Row 1: variable names
  const nameRow = SPSS_COLUMNS.map((c) => escapeCsvCell(c.name)).join(",");
  // Row 2: variable labels (SPSS codebook row)
  const labelRow = SPSS_COLUMNS.map((c) => escapeCsvCell(c.label)).join(",");

  // Data rows
  const dataRows = await Promise.all(
    rows.map(async (row) => {
      const cells = await Promise.all(
        SPSS_COLUMNS.map(async (col) => {
          let val = col.getValue(row, anon);
          if (typeof val === "string" && val.startsWith("__HASH__")) {
            val = await stableHash(val.slice(8));
          }
          return escapeCsvCell(val);
        }),
      );
      return cells.join(",");
    }),
  );

  const csv = [nameRow, labelRow, ...dataRows].join("\r\n");
  const buffer = Buffer.from("﻿" + csv, "utf-8");

  return {
    buffer,
    contentType: "text/csv; charset=utf-8",
    filename: `technicians-spss-${Date.now()}.csv`,
  };
}
