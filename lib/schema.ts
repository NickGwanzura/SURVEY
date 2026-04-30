import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { AGE_GROUPS, GENDERS, YEARS_EXPERIENCE } from "./constants/ageGroups";
import {
  BIGGEST_DAILY_CHALLENGES,
  ENERGY_EFFICIENT_INSTALL,
  LOAD_SHEDDING_FREQUENCIES,
  PPE_ACCESS,
  PREFERRED_LANGUAGES,
  RECOVERY_EQUIPMENT_USE,
  SUBMISSION_SOURCES,
  SUBMISSION_STATUSES,
} from "./constants/challenges";
import { EDUCATION_LEVELS } from "./constants/educationLevels";
import { PROVINCES } from "./constants/provinces";
import { HAS_CERTIFICATION_OPTIONS } from "./constants/refrigerants";
import type { MainWorkFocus } from "./constants/workFocus";

export const genderEnum = pgEnum("gender", GENDERS);
export const ageGroupEnum = pgEnum("age_group", AGE_GROUPS);
export const educationLevelEnum = pgEnum("education_level", EDUCATION_LEVELS);
export const yearsExperienceEnum = pgEnum(
  "years_experience",
  YEARS_EXPERIENCE,
);
export const provinceEnum = pgEnum("province", PROVINCES);
export const hasCertificationEnum = pgEnum(
  "has_certification",
  HAS_CERTIFICATION_OPTIONS,
);
export const biggestDailyChallengeEnum = pgEnum(
  "biggest_daily_challenge",
  BIGGEST_DAILY_CHALLENGES,
);
export const loadSheddingFrequencyEnum = pgEnum(
  "load_shedding_frequency",
  LOAD_SHEDDING_FREQUENCIES,
);
export const recoveryEquipmentUseEnum = pgEnum(
  "recovery_equipment_use",
  RECOVERY_EQUIPMENT_USE,
);
export const ppeAccessEnum = pgEnum("ppe_access", PPE_ACCESS);
export const energyEfficientInstallEnum = pgEnum(
  "energy_efficient_install",
  ENERGY_EFFICIENT_INSTALL,
);
export const preferredLanguageEnum = pgEnum(
  "preferred_language",
  PREFERRED_LANGUAGES,
);
export const submissionStatusEnum = pgEnum(
  "submission_status",
  SUBMISSION_STATUSES,
);
export const submissionSourceEnum = pgEnum(
  "submission_source",
  SUBMISSION_SOURCES,
);

export const adminRoleEnum = pgEnum("admin_role", ["admin", "super_admin"]);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: adminRoleEnum("role").notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("admin_users_email_unique_idx").on(table.email),
  }),
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    adminUserIdx: index("admin_sessions_admin_user_idx").on(table.adminUserId),
    expiresAtIdx: index("admin_sessions_expires_at_idx").on(table.expiresAt),
  }),
);

export const techniciansSurvey = pgTable(
  "technicians_survey",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: submissionStatusEnum("status").notNull().default("pending"),

    // Section 1 — Background
    firstName: text("first_name").notNull(),
    surname: text("surname").notNull(),
    gender: genderEnum("gender").notNull(),
    ageGroup: ageGroupEnum("age_group").notNull(),
    educationLevel: educationLevelEnum("education_level").notNull(),
    yearsExperience: yearsExperienceEnum("years_experience").notNull(),
    mainWorkFocus: jsonb("main_work_focus")
      .$type<MainWorkFocus[]>()
      .notNull(),
    mainWorkFocusOther: text("main_work_focus_other"),

    province: provinceEnum("province").notNull(),
    city: text("city").notNull(),
    suburb: text("suburb").notNull(),
    gpsLatitude: numeric("gps_latitude", { precision: 10, scale: 7 }),
    gpsLongitude: numeric("gps_longitude", { precision: 10, scale: 7 }),
    gpsAccuracyMeters: numeric("gps_accuracy_meters", {
      precision: 10,
      scale: 2,
    }),

    phone: text("phone").notNull(),
    email: text("email"),

    // Section 2 — Skills and Training
    hasFormalTraining: boolean("has_formal_training").notNull(),
    trainingInstitution: text("training_institution"),
    trainingYear: integer("training_year"),

    hasCertification: hasCertificationEnum("has_certification").notNull(),
    certificationsHeld: jsonb("certifications_held").$type<string[]>(),
    hevacrazMemberNumber: text("hevacraz_member_number"),

    confidenceTraditionalRefrigerants: integer(
      "confidence_traditional_refrigerants",
    ).notNull(),
    confidenceLowGwpRefrigerants: integer(
      "confidence_low_gwp_refrigerants",
    ).notNull(),

    accessToTools: integer("access_to_tools").notNull(),
    accessToSpareParts: integer("access_to_spare_parts").notNull(),
    accessToLowGwpRefrigerants: integer(
      "access_to_low_gwp_refrigerants",
    ).notNull(),

    // Section 3 — Obstacles (Likert 1-5)
    obstacleHighImportCosts: integer("obstacle_high_import_costs").notNull(),
    obstacleForexShortages: integer("obstacle_forex_shortages").notNull(),
    obstacleUnreliableSuppliers: integer(
      "obstacle_unreliable_suppliers",
    ).notNull(),
    obstacleCounterfeitProducts: integer(
      "obstacle_counterfeit_products",
    ).notNull(),
    obstaclesOther: text("obstacles_other"),

    // Section 4 — Work Challenges
    biggestDailyChallenge: biggestDailyChallengeEnum(
      "biggest_daily_challenge",
    ).notNull(),
    biggestDailyChallengeOther: text("biggest_daily_challenge_other"),

    loadSheddingFrequency: loadSheddingFrequencyEnum(
      "load_shedding_frequency",
    ).notNull(),

    refrigerantRecoveryEquipmentUse: recoveryEquipmentUseEnum(
      "refrigerant_recovery_equipment_use",
    ).notNull(),
    ppeAccess: ppeAccessEnum("ppe_access").notNull(),

    ehsComplianceBarriers: jsonb("ehs_compliance_barriers")
      .$type<string[]>()
      .notNull(),
    ehsComplianceBarriersOther: text("ehs_compliance_barriers_other"),

    // Section 5 — Energy Efficiency
    installsEnergyEfficient: energyEfficientInstallEnum(
      "installs_energy_efficient",
    ).notNull(),
    energyEfficientBarriers: jsonb("energy_efficient_barriers").$type<
      string[]
    >(),
    energyEfficientBarriersOther: text("energy_efficient_barriers_other"),

    // Section 6 — Consent
    consentToContact: boolean("consent_to_contact").notNull(),
    consentToPublicRegistry: boolean("consent_to_public_registry").notNull(),
    preferredLanguage: preferredLanguageEnum("preferred_language").notNull(),
    profilePhotoUrl: text("profile_photo_url"),

    // Metadata
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    submissionSource: submissionSourceEnum("submission_source")
      .notNull()
      .default("web"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    phoneIdx: index("technicians_survey_phone_idx").on(table.phone),
    emailIdx: index("technicians_survey_email_idx").on(table.email),
    provinceIdx: index("technicians_survey_province_idx").on(table.province),
    mainWorkFocusIdx: index("technicians_survey_main_work_focus_idx")
      .using("gin", table.mainWorkFocus),
    submittedAtIdx: index("technicians_survey_submitted_at_idx").on(
      table.submittedAt,
    ),
    statusIdx: index("technicians_survey_status_idx").on(table.status),
  }),
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => techniciansSurvey.id, { onDelete: "cascade" }),
    actorAdminUserId: uuid("actor_admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "restrict" }),
    action: text("action").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    surveyIdx: index("audit_log_survey_idx").on(table.surveyId),
    actorIdx: index("audit_log_actor_idx").on(table.actorAdminUserId),
    createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
  }),
);

export const exportLog = pgTable("export_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorAdminUserId: uuid("actor_admin_user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "restrict" }),
  format: text("format").notNull(),
  filters: jsonb("filters"),
  rowCount: integer("row_count").notNull(),
  anonymised: boolean("anonymised").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TechnicianSurvey = typeof techniciansSurvey.$inferSelect;
export type NewTechnicianSurvey = typeof techniciansSurvey.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
export type ExportLogEntry = typeof exportLog.$inferSelect;
export type NewExportLogEntry = typeof exportLog.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;

export const _likertCheckSql = sql`/* Likert checks applied via SQL CHECK constraints in migration */`;
