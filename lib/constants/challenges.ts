export const BIGGEST_DAILY_CHALLENGES = [
  "power_outages",
  "forex_shortages",
  "spare_parts",
  "counterfeit",
  "unsafe_conditions",
  "customer_payment",
  "training_opportunities",
  "certification_access",
  "transport_mobility",
  "unqualified_competition",
  "other",
] as const;

export type BiggestDailyChallenge = (typeof BIGGEST_DAILY_CHALLENGES)[number];

export const BIGGEST_DAILY_CHALLENGE_LABELS: Record<
  BiggestDailyChallenge,
  string
> = {
  power_outages: "Power outages and load shedding",
  forex_shortages: "Forex shortages and pricing volatility",
  spare_parts: "Lack of spare parts",
  counterfeit: "Counterfeit refrigerants and parts",
  unsafe_conditions: "Unsafe working conditions",
  customer_payment: "Customers unable to pay",
  training_opportunities: "Lack of training opportunities",
  certification_access: "Limited access to certifications",
  transport_mobility: "Transport and mobility issues",
  unqualified_competition: "Competition from unqualified workers",
  other: "Other (specify)",
};

export const LOAD_SHEDDING_FREQUENCIES = [
  "never",
  "rarely",
  "occasionally",
  "frequently",
  "daily",
] as const;

export type LoadSheddingFrequency = (typeof LOAD_SHEDDING_FREQUENCIES)[number];

export const LOAD_SHEDDING_FREQUENCY_LABELS: Record<
  LoadSheddingFrequency,
  string
> = {
  never: "Never",
  rarely: "Rarely (less than once a month)",
  occasionally: "Occasionally (1-3 times a month)",
  frequently: "Frequently (1-3 times a week)",
  daily: "Daily",
};

export const RECOVERY_EQUIPMENT_USE = [
  "always",
  "sometimes",
  "rarely",
  "never",
  "no_access",
] as const;

export type RecoveryEquipmentUse = (typeof RECOVERY_EQUIPMENT_USE)[number];

export const RECOVERY_EQUIPMENT_USE_LABELS: Record<
  RecoveryEquipmentUse,
  string
> = {
  always: "Yes, always",
  sometimes: "Sometimes",
  rarely: "Rarely",
  never: "Never",
  no_access: "I don't have access to recovery equipment",
};

export const PPE_ACCESS = [
  "full_provided",
  "partial_provided",
  "self_provided",
  "none",
] as const;

export type PpeAccess = (typeof PPE_ACCESS)[number];

export const PPE_ACCESS_LABELS: Record<PpeAccess, string> = {
  full_provided: "Yes, full set provided",
  partial_provided: "Yes, partial set",
  self_provided: "I provide my own",
  none: "No PPE access",
};

export const EHS_BARRIERS = [
  "cost_of_compliance",
  "lack_of_training",
  "time_pressure",
  "no_enforcement",
  "lack_of_equipment",
  "compliant",
  "other",
] as const;

export type EhsBarrier = (typeof EHS_BARRIERS)[number];

export const EHS_BARRIER_LABELS: Record<EhsBarrier, string> = {
  cost_of_compliance: "Cost of compliance",
  lack_of_training: "Lack of training on EHS standards",
  time_pressure: "Time pressure from clients",
  no_enforcement: "No enforcement",
  lack_of_equipment: "Lack of equipment",
  compliant: "I am compliant",
  other: "Other (specify)",
};

export const ENERGY_EFFICIENT_INSTALL = [
  "always",
  "on_request",
  "sometimes",
  "rarely",
  "never",
] as const;

export type EnergyEfficientInstall = (typeof ENERGY_EFFICIENT_INSTALL)[number];

export const ENERGY_EFFICIENT_INSTALL_LABELS: Record<
  EnergyEfficientInstall,
  string
> = {
  always: "Yes, always",
  on_request: "Yes, when the customer requests it",
  sometimes: "Sometimes",
  rarely: "Rarely",
  never: "Never",
};

export const ENERGY_EFFICIENT_BARRIERS = [
  "upfront_cost",
  "customer_preference_cheaper",
  "limited_availability",
  "lack_of_training_ee",
  "customer_awareness",
  "long_lead_times",
  "forex_requirements",
  "other",
] as const;

export type EnergyEfficientBarrier = (typeof ENERGY_EFFICIENT_BARRIERS)[number];

export const ENERGY_EFFICIENT_BARRIER_LABELS: Record<
  EnergyEfficientBarrier,
  string
> = {
  upfront_cost: "Higher upfront cost for the customer",
  customer_preference_cheaper: "Customer preference for cheaper options",
  limited_availability:
    "Limited availability of energy-efficient equipment",
  lack_of_training_ee: "Lack of training on energy-efficient systems",
  customer_awareness: "Lack of customer awareness",
  long_lead_times: "Long lead times for imports",
  forex_requirements: "Forex requirements",
  other: "Other (specify)",
};

export const PREFERRED_LANGUAGES = ["english", "shona", "ndebele"] as const;
export type PreferredLanguage = (typeof PREFERRED_LANGUAGES)[number];
export const PREFERRED_LANGUAGE_LABELS: Record<PreferredLanguage, string> = {
  english: "English",
  shona: "Shona",
  ndebele: "Ndebele",
};

export const SUBMISSION_STATUSES = [
  "pending",
  "verified",
  "flagged",
  "duplicate",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_SOURCES = [
  "web",
  "pwa_offline_sync",
  "admin_entry",
] as const;
export type SubmissionSource = (typeof SUBMISSION_SOURCES)[number];
