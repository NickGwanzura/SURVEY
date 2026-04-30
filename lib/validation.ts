import { z } from "zod";

import { AGE_GROUPS, GENDERS, YEARS_EXPERIENCE } from "./constants/ageGroups";
import {
  BIGGEST_DAILY_CHALLENGES,
  EHS_BARRIERS,
  ENERGY_EFFICIENT_BARRIERS,
  ENERGY_EFFICIENT_INSTALL,
  LOAD_SHEDDING_FREQUENCIES,
  PPE_ACCESS,
  PREFERRED_LANGUAGES,
  RECOVERY_EQUIPMENT_USE,
} from "./constants/challenges";
import { EDUCATION_LEVELS } from "./constants/educationLevels";
import { PROVINCES } from "./constants/provinces";
import {
  CERTIFICATION_TYPES,
  HAS_CERTIFICATION_OPTIONS,
} from "./constants/refrigerants";
import { MAIN_WORK_FOCUS } from "./constants/workFocus";

// =============================================================================
// Field-level helpers
// =============================================================================

export const ZIMBABWE_PHONE_REGEX = /^\+263[0-9]{9}$/;
const NAME_REGEX = /^[\p{L}\s'-]{2,50}$/u;

const likertField = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} is required.` })
    .int(`${label} must be a whole number.`)
    .min(1, `${label} must be between 1 and 5.`)
    .max(5, `${label} must be between 1 and 5.`);

const optionalString = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v ? v : undefined));

const optionalShortString = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : undefined));

// =============================================================================
// Per-section schemas — mirror the survey wizard steps
// =============================================================================

export const backgroundStepSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .regex(NAME_REGEX, "Letters, spaces, hyphens or apostrophes only (2-50)."),
    surname: z
      .string()
      .trim()
      .regex(NAME_REGEX, "Letters, spaces, hyphens or apostrophes only (2-50)."),
    gender: z.enum(GENDERS, {
      errorMap: () => ({ message: "Please choose an option." }),
    }),
    ageGroup: z.enum(AGE_GROUPS, {
      errorMap: () => ({ message: "Please choose an age group." }),
    }),
    educationLevel: z.enum(EDUCATION_LEVELS, {
      errorMap: () => ({ message: "Please choose your education level." }),
    }),
    yearsExperience: z.enum(YEARS_EXPERIENCE, {
      errorMap: () => ({ message: "Please choose how long you have worked." }),
    }),
    mainWorkFocus: z
      .array(z.enum(MAIN_WORK_FOCUS))
      .min(1, "Please choose at least one work focus."),
    mainWorkFocusOther: optionalShortString,
    province: z.enum(PROVINCES, {
      errorMap: () => ({ message: "Please choose a province." }),
    }),
    city: z.string().trim().min(2, "City or town is required.").max(100),
    suburb: z.string().trim().min(2, "Suburb or area is required.").max(100),
    gpsLatitude: z
      .number()
      .min(-90)
      .max(90)
      .nullable()
      .optional(),
    gpsLongitude: z
      .number()
      .min(-180)
      .max(180)
      .nullable()
      .optional(),
    gpsAccuracyMeters: z.number().min(0).nullable().optional(),
    phone: z
      .string()
      .trim()
      .regex(
        ZIMBABWE_PHONE_REGEX,
        "Use the format +263 followed by 9 digits (e.g. +263771234567).",
      ),
    email: z
      .union([z.literal(""), z.string().trim().email("Enter a valid email.")])
      .optional()
      .transform((v) => (v ? v : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.mainWorkFocus.includes("other") && !data.mainWorkFocusOther) {
      ctx.addIssue({
        code: "custom",
        path: ["mainWorkFocusOther"],
        message: "Please describe your main work focus.",
      });
    }
  });

export const skillsTrainingStepSchema = z
  .object({
    hasFormalTraining: z.boolean({
      errorMap: () => ({ message: "Please answer Yes or No." }),
    }),
    trainingInstitution: optionalShortString,
    trainingYear: z
      .number()
      .int()
      .min(1950)
      .max(new Date().getFullYear())
      .optional()
      .nullable(),
    hasCertification: z.enum(HAS_CERTIFICATION_OPTIONS, {
      errorMap: () => ({ message: "Please choose an option." }),
    }),
    certificationsHeld: z
      .array(z.enum(CERTIFICATION_TYPES))
      .optional()
      .default([]),
    hevacrazMemberNumber: optionalShortString,
    confidenceTraditionalRefrigerants: likertField(
      "Confidence with traditional refrigerants",
    ),
    confidenceLowGwpRefrigerants: likertField(
      "Confidence with low-GWP refrigerants",
    ),
    accessToTools: likertField("Access to tools and equipment"),
    accessToSpareParts: likertField("Access to spare parts"),
    accessToLowGwpRefrigerants: likertField(
      "Access to low-GWP refrigerants",
    ),
  })
  .superRefine((data, ctx) => {
    if (data.hasFormalTraining) {
      if (!data.trainingInstitution) {
        ctx.addIssue({
          code: "custom",
          path: ["trainingInstitution"],
          message: "Please tell us where you trained.",
        });
      }
      if (data.trainingYear == null) {
        ctx.addIssue({
          code: "custom",
          path: ["trainingYear"],
          message: "Please enter the year you completed training.",
        });
      }
    }
    if (data.hasCertification === "yes") {
      if (!data.certificationsHeld || data.certificationsHeld.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["certificationsHeld"],
          message: "Please select at least one certification.",
        });
      }
      if (
        data.certificationsHeld?.includes("hevacraz_membership") &&
        !data.hevacrazMemberNumber
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["hevacrazMemberNumber"],
          message: "Please enter your HEVACRAZ membership number.",
        });
      }
    }
  });

export const toolsResourcesStepSchema = z.object({
  obstacleHighImportCosts: likertField("High import costs"),
  obstacleForexShortages: likertField("Forex shortages"),
  obstacleUnreliableSuppliers: likertField("Unreliable suppliers"),
  obstacleCounterfeitProducts: likertField("Counterfeit products"),
  obstaclesOther: optionalString,
});

export const workChallengesStepSchema = z
  .object({
    biggestDailyChallenge: z.enum(BIGGEST_DAILY_CHALLENGES, {
      errorMap: () => ({ message: "Please choose your biggest challenge." }),
    }),
    biggestDailyChallengeOther: optionalShortString,
    loadSheddingFrequency: z.enum(LOAD_SHEDDING_FREQUENCIES, {
      errorMap: () => ({ message: "Please choose how often." }),
    }),
    refrigerantRecoveryEquipmentUse: z.enum(RECOVERY_EQUIPMENT_USE, {
      errorMap: () => ({ message: "Please choose an option." }),
    }),
    ppeAccess: z.enum(PPE_ACCESS, {
      errorMap: () => ({ message: "Please choose an option." }),
    }),
    ehsComplianceBarriers: z
      .array(z.enum(EHS_BARRIERS))
      .min(1, "Select at least one option."),
    ehsComplianceBarriersOther: optionalString,
  })
  .superRefine((data, ctx) => {
    if (
      data.biggestDailyChallenge === "other" &&
      !data.biggestDailyChallengeOther
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["biggestDailyChallengeOther"],
        message: "Please describe the challenge.",
      });
    }
    if (
      data.ehsComplianceBarriers.includes("other") &&
      !data.ehsComplianceBarriersOther
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["ehsComplianceBarriersOther"],
        message: "Please describe the other barrier.",
      });
    }
  });

export const energyEfficiencyStepSchema = z
  .object({
    installsEnergyEfficient: z.enum(ENERGY_EFFICIENT_INSTALL, {
      errorMap: () => ({ message: "Please choose an option." }),
    }),
    energyEfficientBarriers: z
      .array(z.enum(ENERGY_EFFICIENT_BARRIERS))
      .optional()
      .default([]),
    energyEfficientBarriersOther: optionalString,
  })
  .superRefine((data, ctx) => {
    if (
      data.installsEnergyEfficient !== "always" &&
      (!data.energyEfficientBarriers ||
        data.energyEfficientBarriers.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["energyEfficientBarriers"],
        message: "Please select at least one reason.",
      });
    }
    if (
      data.energyEfficientBarriers?.includes("other") &&
      !data.energyEfficientBarriersOther
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["energyEfficientBarriersOther"],
        message: "Please describe the other reason.",
      });
    }
  });

export const consentStepSchema = z.object({
  consentToContact: z.boolean({
    errorMap: () => ({ message: "Please answer Yes or No." }),
  }),
  consentToPublicRegistry: z.boolean({
    errorMap: () => ({ message: "Please answer Yes or No." }),
  }),
  preferredLanguage: z.enum(PREFERRED_LANGUAGES, {
    errorMap: () => ({ message: "Please choose a language." }),
  }),
  profilePhotoUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .transform((v) => (v ? v : undefined)),
});

// =============================================================================
// Combined schema — used by the API submit endpoint
// =============================================================================

export const surveySubmissionSchema = z
  .object({
    // section 1
    firstName: z.string().trim().regex(NAME_REGEX),
    surname: z.string().trim().regex(NAME_REGEX),
    gender: z.enum(GENDERS),
    ageGroup: z.enum(AGE_GROUPS),
    educationLevel: z.enum(EDUCATION_LEVELS),
    yearsExperience: z.enum(YEARS_EXPERIENCE),
    mainWorkFocus: z.array(z.enum(MAIN_WORK_FOCUS)).min(1),
    mainWorkFocusOther: optionalShortString,
    province: z.enum(PROVINCES),
    city: z.string().trim().min(2).max(100),
    suburb: z.string().trim().min(2).max(100),
    gpsLatitude: z.number().min(-90).max(90).nullable().optional(),
    gpsLongitude: z.number().min(-180).max(180).nullable().optional(),
    gpsAccuracyMeters: z.number().min(0).nullable().optional(),
    phone: z.string().trim().regex(ZIMBABWE_PHONE_REGEX),
    email: z
      .union([z.literal(""), z.string().trim().email()])
      .optional()
      .transform((v) => (v ? v : undefined)),

    // section 2
    hasFormalTraining: z.boolean(),
    trainingInstitution: optionalShortString,
    trainingYear: z.number().int().min(1950).max(2100).nullable().optional(),
    hasCertification: z.enum(HAS_CERTIFICATION_OPTIONS),
    certificationsHeld: z.array(z.enum(CERTIFICATION_TYPES)).optional(),
    hevacrazMemberNumber: optionalShortString,
    confidenceTraditionalRefrigerants: likertField("Confidence (traditional)"),
    confidenceLowGwpRefrigerants: likertField("Confidence (low-GWP)"),
    accessToTools: likertField("Access to tools"),
    accessToSpareParts: likertField("Access to spare parts"),
    accessToLowGwpRefrigerants: likertField("Access to low-GWP"),

    // section 3
    obstacleHighImportCosts: likertField("Import costs"),
    obstacleForexShortages: likertField("Forex shortages"),
    obstacleUnreliableSuppliers: likertField("Unreliable suppliers"),
    obstacleCounterfeitProducts: likertField("Counterfeit products"),
    obstaclesOther: optionalString,

    // section 4
    biggestDailyChallenge: z.enum(BIGGEST_DAILY_CHALLENGES),
    biggestDailyChallengeOther: optionalShortString,
    loadSheddingFrequency: z.enum(LOAD_SHEDDING_FREQUENCIES),
    refrigerantRecoveryEquipmentUse: z.enum(RECOVERY_EQUIPMENT_USE),
    ppeAccess: z.enum(PPE_ACCESS),
    ehsComplianceBarriers: z.array(z.enum(EHS_BARRIERS)).min(1),
    ehsComplianceBarriersOther: optionalString,

    // section 5
    installsEnergyEfficient: z.enum(ENERGY_EFFICIENT_INSTALL),
    energyEfficientBarriers: z
      .array(z.enum(ENERGY_EFFICIENT_BARRIERS))
      .optional(),
    energyEfficientBarriersOther: optionalString,

    // section 6
    consentToContact: z.boolean(),
    consentToPublicRegistry: z.boolean(),
    preferredLanguage: z.enum(PREFERRED_LANGUAGES),
    profilePhotoUrl: z
      .string()
      .url()
      .optional()
      .nullable()
      .transform((v) => (v ? v : undefined)),

    // metadata (set server-side; clients submit empty values)
    submissionSource: z
      .enum(["web", "pwa_offline_sync", "admin_entry"])
      .default("web"),
  })
  .superRefine((data, ctx) => {
    if (data.mainWorkFocus.includes("other") && !data.mainWorkFocusOther) {
      ctx.addIssue({
        code: "custom",
        path: ["mainWorkFocusOther"],
        message: "Required",
      });
    }
    if (
      data.biggestDailyChallenge === "other" &&
      !data.biggestDailyChallengeOther
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["biggestDailyChallengeOther"],
        message: "Required",
      });
    }
    if (
      data.ehsComplianceBarriers.includes("other") &&
      !data.ehsComplianceBarriersOther
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["ehsComplianceBarriersOther"],
        message: "Required",
      });
    }
    if (
      data.installsEnergyEfficient !== "always" &&
      (!data.energyEfficientBarriers ||
        data.energyEfficientBarriers.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["energyEfficientBarriers"],
        message: "Required",
      });
    }
    if (data.hasFormalTraining) {
      if (!data.trainingInstitution) {
        ctx.addIssue({
          code: "custom",
          path: ["trainingInstitution"],
          message: "Required",
        });
      }
      if (data.trainingYear == null) {
        ctx.addIssue({
          code: "custom",
          path: ["trainingYear"],
          message: "Required",
        });
      }
    }
    if (data.hasCertification === "yes") {
      if (!data.certificationsHeld || data.certificationsHeld.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["certificationsHeld"],
          message: "Required",
        });
      }
      if (
        data.certificationsHeld?.includes("hevacraz_membership") &&
        !data.hevacrazMemberNumber
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["hevacrazMemberNumber"],
          message: "Required",
        });
      }
    }
  });

export type SurveySubmission = z.infer<typeof surveySubmissionSchema>;
export type BackgroundStepValues = z.infer<typeof backgroundStepSchema>;
export type SkillsTrainingStepValues = z.infer<typeof skillsTrainingStepSchema>;
export type ToolsResourcesStepValues = z.infer<typeof toolsResourcesStepSchema>;
export type WorkChallengesStepValues = z.infer<typeof workChallengesStepSchema>;
export type EnergyEfficiencyStepValues = z.infer<
  typeof energyEfficiencyStepSchema
>;
export type ConsentStepValues = z.infer<typeof consentStepSchema>;

// =============================================================================
// Helpers
// =============================================================================

export const checkPhoneQuerySchema = z.object({
  phone: z.string().trim().regex(ZIMBABWE_PHONE_REGEX),
});

export const photoUploadRequestSchema = z.object({
  contentType: z
    .string()
    .regex(/^image\/(jpe?g|png|webp)$/i, "Only JPG, PNG or WebP images."),
  byteLength: z
    .number()
    .int()
    .min(1)
    .max(2_000_000, "Photo must be smaller than 2 MB after compression."),
});
