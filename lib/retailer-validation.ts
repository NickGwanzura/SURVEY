import { z } from "zod";

import {
  BUSINESS_TYPES,
  PRODUCT_CATEGORIES,
  SOURCING_OPTIONS,
  BUSINESS_SIZES,
  CUSTOMER_TYPES,
  SUPPLY_CHALLENGES,
  REFRIGERANT_AWARENESS,
} from "./constants/retailers";
import { PROVINCES } from "./constants/provinces";
import { PREFERRED_LANGUAGES } from "./constants/challenges";

const NAME_REGEX = /^[\p{L}\s'-]{2,50}$/u;
const ZIMBABWE_PHONE_REGEX = /^\+263[0-9]{9}$/;

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
// Per-step schemas
// =============================================================================

export const retailerBusinessStepSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name is required.")
      .max(200),
    contactPersonName: z
      .string()
      .trim()
      .regex(NAME_REGEX, "Letters, spaces, hyphens or apostrophes only (2-50)."),
    businessType: z.enum(BUSINESS_TYPES, {
      errorMap: () => ({ message: "Please choose a business type." }),
    }),
    province: z.enum(PROVINCES, {
      errorMap: () => ({ message: "Please choose a province." }),
    }),
    city: z.string().trim().min(2, "City or town is required.").max(100),
    suburb: z.string().trim().min(2, "Suburb or area is required.").max(100),
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
    businessSize: z.enum(BUSINESS_SIZES, {
      errorMap: () => ({ message: "Please choose your business size." }),
    }),
    yearsInOperation: z
      .number()
      .int()
      .min(0, "Must be 0 or more.")
      .max(100, "Please enter a realistic number."),
    businessRegistrationNumber: optionalShortString,
  });

export const retailerProductsStepSchema = z
  .object({
    productCategories: z
      .array(z.enum(PRODUCT_CATEGORIES))
      .min(1, "Select at least one product category."),
    productCategoriesOther: optionalShortString,
    sourcingChannel: z.enum(SOURCING_OPTIONS, {
      errorMap: () => ({ message: "Please choose your main sourcing channel." }),
    }),
    localSourcingPercent: z
      .number()
      .int()
      .min(0)
      .max(100)
      .nullable()
      .optional(),
    brandsCarried: optionalString,
    customerTypes: z
      .array(z.enum(CUSTOMER_TYPES))
      .min(1, "Select at least one customer type."),
    refrigerantAwareness: z.enum(REFRIGERANT_AWARENESS, {
      errorMap: () => ({
        message: "Please choose your awareness level.",
      }),
    }),
    stocksLowGwp: z.boolean({
      errorMap: () => ({ message: "Please answer Yes or No." }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.productCategories.includes("other") && !data.productCategoriesOther) {
      ctx.addIssue({
        code: "custom",
        path: ["productCategoriesOther"],
        message: "Please describe the product category.",
      });
    }
    if (data.sourcingChannel === "mix" && data.localSourcingPercent == null) {
      ctx.addIssue({
        code: "custom",
        path: ["localSourcingPercent"],
        message: "Please indicate the approximate local sourcing percentage.",
      });
    }
  });

export const retailerChallengesStepSchema = z
  .object({
    supplyChallenges: z
      .array(z.enum(SUPPLY_CHALLENGES))
      .min(1, "Select at least one challenge."),
    supplyChallengesOther: optionalString,
    biggestDailyChallenge: z.string().trim().min(2, "Please describe your biggest daily challenge.").max(500),
    loadSheddingImpact: z.coerce
      .number({ invalid_type_error: "Please rate the impact." })
      .int()
      .min(1, "Must be between 1 and 5.")
      .max(5, "Must be between 1 and 5."),
    regulatoryBarriers: optionalString,
    competitionLevel: z.coerce
      .number({ invalid_type_error: "Please rate the competition level." })
      .int()
      .min(1, "Must be between 1 and 5.")
      .max(5, "Must be between 1 and 5."),
    pricePressure: z.coerce
      .number({ invalid_type_error: "Please rate the price pressure." })
      .int()
      .min(1, "Must be between 1 and 5.")
      .max(5, "Must be between 1 and 5."),
    interestedInTraining: z.boolean({
      errorMap: () => ({ message: "Please answer Yes or No." }),
    }),
    trainingTopics: optionalString,
  })
  .superRefine((data, ctx) => {
    if (data.supplyChallenges.includes("other") && !data.supplyChallengesOther) {
      ctx.addIssue({
        code: "custom",
        path: ["supplyChallengesOther"],
        message: "Please describe the challenge.",
      });
    }
  });

export const retailerConsentStepSchema = z.object({
  consentToContact: z.boolean({
    errorMap: () => ({ message: "Please answer Yes or No." }),
  }),
  preferredLanguage: z.enum(PREFERRED_LANGUAGES, {
    errorMap: () => ({ message: "Please choose a language." }),
  }),
  dataConsentAccepted: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the Data Protection Notice to submit.",
    }),
  }),
});

// =============================================================================
// Combined schema for the API
// =============================================================================

const _retailerBaseSchema = z.object({
  // Step 1 — Business
  businessName: z.string().trim().min(2).max(200),
  contactPersonName: z.string().trim().regex(NAME_REGEX),
  businessType: z.enum(BUSINESS_TYPES),
  province: z.enum(PROVINCES),
  city: z.string().trim().min(2).max(100),
  suburb: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(ZIMBABWE_PHONE_REGEX),
  email: z
    .union([z.literal(""), z.string().trim().email()])
    .optional()
    .transform((v) => (v ? v : undefined)),
  businessSize: z.enum(BUSINESS_SIZES),
  yearsInOperation: z.number().int().min(0).max(100),
  businessRegistrationNumber: optionalShortString,

  // Step 2 — Products & Sourcing
  productCategories: z.array(z.enum(PRODUCT_CATEGORIES)).min(1),
  productCategoriesOther: optionalShortString,
  sourcingChannel: z.enum(SOURCING_OPTIONS),
  localSourcingPercent: z.number().int().min(0).max(100).nullable().optional(),
  brandsCarried: optionalString,
  customerTypes: z.array(z.enum(CUSTOMER_TYPES)).min(1),
  refrigerantAwareness: z.enum(REFRIGERANT_AWARENESS),
  stocksLowGwp: z.boolean(),

  // Step 3 — Challenges
  supplyChallenges: z.array(z.enum(SUPPLY_CHALLENGES)).min(1),
  supplyChallengesOther: optionalShortString,
  biggestDailyChallenge: z.string().trim().min(2).max(500),
  loadSheddingImpact: z.coerce.number().int().min(1).max(5),
  regulatoryBarriers: optionalString,
  competitionLevel: z.coerce.number().int().min(1).max(5),
  pricePressure: z.coerce.number().int().min(1).max(5),
  interestedInTraining: z.boolean(),
  trainingTopics: optionalString,

  // Step 4 — Consent
  consentToContact: z.boolean(),
  preferredLanguage: z.enum(PREFERRED_LANGUAGES),
  dataConsentAccepted: z.boolean().optional().default(false),
});

function applyRetailerRefinements<
  T extends z.infer<typeof _retailerBaseSchema>,
>(data: T, ctx: z.RefinementCtx) {
  if (data.productCategories.includes("other") && !data.productCategoriesOther) {
    ctx.addIssue({
      code: "custom",
      path: ["productCategoriesOther"],
      message: "Required",
    });
  }
  if (data.sourcingChannel === "mix" && data.localSourcingPercent == null) {
    ctx.addIssue({
      code: "custom",
      path: ["localSourcingPercent"],
      message: "Required",
    });
  }
  if (data.supplyChallenges.includes("other") && !data.supplyChallengesOther) {
    ctx.addIssue({
      code: "custom",
      path: ["supplyChallengesOther"],
      message: "Required",
    });
  }
}

export const retailerSurveySubmissionSchema = _retailerBaseSchema
  .extend({
    submissionSource: z
      .enum(["web", "pwa_offline_sync", "admin_entry"])
      .default("web"),
  })
  .superRefine(applyRetailerRefinements);

export const retailerSurveyUpdateSchema =
  _retailerBaseSchema.superRefine(applyRetailerRefinements);

export type RetailerSurveySubmission = z.infer<
  typeof retailerSurveySubmissionSchema
>;
export type RetailerSurveyUpdate = z.infer<typeof retailerSurveyUpdateSchema>;
export type RetailerBusinessStepValues = z.infer<
  typeof retailerBusinessStepSchema
>;
export type RetailerProductsStepValues = z.infer<
  typeof retailerProductsStepSchema
>;
export type RetailerChallengesStepValues = z.infer<
  typeof retailerChallengesStepSchema
>;
export type RetailerConsentStepValues = z.infer<
  typeof retailerConsentStepSchema
>;
