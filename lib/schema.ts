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
import {
  BUSINESS_TYPES,
  PRODUCT_CATEGORIES,
  SOURCING_OPTIONS,
  BUSINESS_SIZES,
  CUSTOMER_TYPES,
  SUPPLY_CHALLENGES,
  REFRIGERANT_AWARENESS,
} from "./constants/retailers";

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

// Retailer survey enums
export const businessTypeEnum = pgEnum("business_type", BUSINESS_TYPES);
export const productCategoryEnum = pgEnum("product_category", PRODUCT_CATEGORIES);
export const sourcingOptionEnum = pgEnum("sourcing_option", SOURCING_OPTIONS);
export const businessSizeEnum = pgEnum("business_size", BUSINESS_SIZES);
export const customerTypeEnum = pgEnum("customer_type", CUSTOMER_TYPES);
export const supplyChallengeEnum = pgEnum("supply_challenge", SUPPLY_CHALLENGES);
export const refrigerantAwarenessEnum = pgEnum(
  "refrigerant_awareness",
  REFRIGERANT_AWARENESS,
);
export const auditActorTypeEnum = pgEnum("audit_actor_type", [
  "admin",
  "applicant",
]);

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
    registrationNumber: text("registration_number").unique(),

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
    certificationNumber: text("certification_number"),
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

    // Data Protection Consent
    dataConsentAccepted: boolean("data_consent_accepted").notNull().default(false),
    dataConsentAcceptedAt: timestamp("data_consent_accepted_at", { withTimezone: true }),
    dataConsentIpAddress: text("data_consent_ip_address"),
    dataConsentUserAgent: text("data_consent_user_agent"),

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
    phoneIdx: uniqueIndex("technicians_survey_phone_unique").on(table.phone),
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

export const retailersSurvey = pgTable(
  "retailers_survey",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
	    status: submissionStatusEnum("status").notNull().default("pending"),
    registrationNumber: text("registration_number").unique(),

    // Step 1 — Business Information
    businessName: text("business_name").notNull(),
    contactPersonName: text("contact_person_name").notNull(),
    businessType: businessTypeEnum("business_type").notNull(),
    province: provinceEnum("province").notNull(),
    city: text("city").notNull(),
    suburb: text("suburb").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    businessSize: businessSizeEnum("business_size").notNull(),
    yearsInOperation: integer("years_in_operation").notNull(),
    businessRegistrationNumber: text("business_registration_number"),

    // Step 2 — Products & Sourcing
    productCategories: jsonb("product_categories")
      .$type<string[]>()
      .notNull(),
    productCategoriesOther: text("product_categories_other"),
    sourcingChannel: sourcingOptionEnum("sourcing_channel").notNull(),
    localSourcingPercent: integer("local_sourcing_percent"),
    brandsCarried: text("brands_carried"),
    customerTypes: jsonb("customer_types").$type<string[]>().notNull(),
    refrigerantAwareness: refrigerantAwarenessEnum(
      "refrigerant_awareness",
    ).notNull(),
    stocksLowGwp: boolean("stocks_low_gwp").notNull(),

    // Step 3 — Challenges
    supplyChallenges: jsonb("supply_challenges").$type<string[]>().notNull(),
    supplyChallengesOther: text("supply_challenges_other"),
    biggestDailyChallenge: text("biggest_daily_challenge").notNull(),
    loadSheddingImpact: integer("load_shedding_impact").notNull(),
    regulatoryBarriers: text("regulatory_barriers"),
    competitionLevel: integer("competition_level").notNull(),
    pricePressure: integer("price_pressure").notNull(),
    interestedInTraining: boolean("interested_in_training").notNull(),
    trainingTopics: text("training_topics"),

    // Step 4 — Consent
    consentToContact: boolean("consent_to_contact").notNull(),
    preferredLanguage: preferredLanguageEnum("preferred_language").notNull(),

    // Data Protection Consent
    dataConsentAccepted: boolean("data_consent_accepted").notNull().default(false),
    dataConsentAcceptedAt: timestamp("data_consent_accepted_at", {
      withTimezone: true,
    }),
    dataConsentIpAddress: text("data_consent_ip_address"),
    dataConsentUserAgent: text("data_consent_user_agent"),

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
    phoneIdx: uniqueIndex("retailers_survey_phone_unique").on(table.phone),
    emailIdx: index("retailers_survey_email_idx").on(table.email),
    provinceIdx: index("retailers_survey_province_idx").on(table.province),
    businessTypeIdx: index("retailers_survey_business_type_idx").on(
      table.businessType,
    ),
    submittedAtIdx: index("retailers_survey_submitted_at_idx").on(
      table.submittedAt,
    ),
    statusIdx: index("retailers_survey_status_idx").on(table.status),
  }),
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => techniciansSurvey.id, { onDelete: "cascade" }),
    actorAdminUserId: uuid("actor_admin_user_id").references(
      () => adminUsers.id,
      { onDelete: "restrict" },
    ),
    actorType: auditActorTypeEnum("actor_type").notNull().default("admin"),
    actorDisplay: text("actor_display"),
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

export const surveyEvents = pgTable(
  "survey_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").notNull(),
    step: integer("step").notNull(),
    stepName: text("step_name").notNull(),
    event: text("event").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    phoneIdx: index("survey_events_phone_idx").on(table.phone),
    stepIdx: index("survey_events_step_idx").on(table.step),
    createdAtIdx: index("survey_events_created_at_idx").on(table.createdAt),
  }),
);

export type TechnicianSurvey = typeof techniciansSurvey.$inferSelect;
export type NewTechnicianSurvey = typeof techniciansSurvey.$inferInsert;
export type RetailersSurvey = typeof retailersSurvey.$inferSelect;
export type NewRetailersSurvey = typeof retailersSurvey.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
export type ExportLogEntry = typeof exportLog.$inferSelect;
export type NewExportLogEntry = typeof exportLog.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    adminUserIdx: index("password_reset_tokens_admin_user_idx").on(table.adminUserId),
    tokenHashIdx: index("password_reset_tokens_token_hash_idx").on(table.tokenHash),
  }),
);

export const systemEvents = pgTable(
  "system_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorAdminUserId: uuid("actor_admin_user_id")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    eventType: text("event_type").notNull(),
    description: text("description").notNull(),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventTypeIdx: index("system_events_event_type_idx").on(table.eventType),
    actorIdx: index("system_events_actor_idx").on(table.actorAdminUserId),
    createdAtIdx: index("system_events_created_at_idx").on(table.createdAt),
  }),
);

export type SurveyEvent = typeof surveyEvents.$inferSelect;
export type NewSurveyEvent = typeof surveyEvents.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type SystemEvent = typeof systemEvents.$inferSelect;
export type NewSystemEvent = typeof systemEvents.$inferInsert;

export const technicianSurveyReports = pgTable(
  "technician_survey_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportTitle: text("report_title").notNull(),
    reportType: text("report_type").notNull().default("technician-survey"),
    surveyName: text("survey_name").notNull(),
    reportingPeriodStart: timestamp("reporting_period_start", { withTimezone: true }).notNull(),
    reportingPeriodEnd: timestamp("reporting_period_end", { withTimezone: true }).notNull(),
    totalResponses: integer("total_responses").notNull(),
    generatedBy: uuid("generated_by").notNull().references(() => adminUsers.id, { onDelete: "restrict" }),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
    status: text("status").notNull().default("completed"),
    pdfUrl: text("pdf_url"),
    aiSummary: jsonb("ai_summary").$type<{
      overview: string;
      keyFindings: string[];
      riskAreas: string[];
      opportunities: string[];
      recommendedInterventions: string[];
      priorityActions: string[];
    }>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    generatedAtIdx: index("tsr_generated_at_idx").on(table.generatedAt),
    generatedByIdx: index("tsr_generated_by_idx").on(table.generatedBy),
  }),
);

export type TechnicianSurveyReport = typeof technicianSurveyReports.$inferSelect;
export type NewTechnicianSurveyReport = typeof technicianSurveyReports.$inferInsert;

export const _likertCheckSql = sql`/* Likert checks applied via SQL CHECK constraints in migration */`;

export const registrationNumberSequence = pgTable("registration_number_sequence", {
  id: uuid("id").primaryKey().defaultRandom(),
  counter: integer("counter").notNull().default(0),
  entityType: text("entity_type").notNull().unique(),
});

export type RegistrationNumberSequence = typeof registrationNumberSequence.$inferSelect;
export type NewRegistrationNumberSequence = typeof registrationNumberSequence.$inferInsert;

/**
 * DB-backed rate limiter table.
 * Stores per-key (IP + route) attempt counts that expire after the window.
 * Shared across all serverless instances so rate limiting is effective at scale.
 */
export const rateLimitEntries = pgTable("rate_limit_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  count: integer("count").notNull().default(1),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  keyIdx: index("rate_limit_entries_key_idx").on(table.key),
}));
