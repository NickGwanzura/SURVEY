export const BUSINESS_TYPES = [
  "retailer",
  "wholesaler",
  "distributor",
  "importer",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  retailer: "Retailer",
  wholesaler: "Wholesaler",
  distributor: "Distributor",
  importer: "Importer",
};

export const PRODUCT_CATEGORIES = [
  "air_conditioners",
  "refrigerators",
  "freezers",
  "compressors",
  "refrigerants",
  "spare_parts",
  "tools_equipment",
  "ppe",
  "thermostats_controls",
  "ducting_insulation",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  air_conditioners: "Air Conditioners",
  refrigerators: "Refrigerators",
  freezers: "Freezers",
  compressors: "Compressors",
  refrigerants: "Refrigerants",
  spare_parts: "Spare Parts",
  tools_equipment: "Tools & Equipment",
  ppe: "PPE (Personal Protective Equipment)",
  thermostats_controls: "Thermostats & Controls",
  ducting_insulation: "Ducting & Insulation",
  other: "Other",
};

export const SOURCING_OPTIONS = [
  "local",
  "regional",
  "abroad",
  "mix",
] as const;

export type SourcingOption = (typeof SOURCING_OPTIONS)[number];

export const SOURCING_OPTION_LABELS: Record<SourcingOption, string> = {
  local: "Locally (Zimbabwe)",
  regional: "Regionally (SADC / Africa)",
  abroad: "Abroad (International)",
  mix: "Mix of sources",
};

export const BUSINESS_SIZES = [
  "solo",
  "2_5",
  "6_15",
  "16_50",
  "50_plus",
] as const;

export type BusinessSize = (typeof BUSINESS_SIZES)[number];

export const BUSINESS_SIZE_LABELS: Record<BusinessSize, string> = {
  solo: "Just me (solo)",
  "2_5": "2 – 5 employees",
  "6_15": "6 – 15 employees",
  "16_50": "16 – 50 employees",
  "50_plus": "50+ employees",
};

export const CUSTOMER_TYPES = [
  "residential",
  "commercial",
  "industrial",
  "government",
  "all",
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  residential: "Residential (homes)",
  commercial: "Commercial (offices, shops)",
  industrial: "Industrial (factories, cold chain)",
  government: "Government / NGO",
  all: "All of the above",
};

export const SUPPLY_CHALLENGES = [
  "import_costs",
  "forex_shortages",
  "unreliable_suppliers",
  "counterfeit_products",
  "customs_delays",
  "stockouts",
  "quality_inconsistency",
  "logistics",
  "other",
] as const;

export type SupplyChallenge = (typeof SUPPLY_CHALLENGES)[number];

export const SUPPLY_CHALLENGE_LABELS: Record<SupplyChallenge, string> = {
  import_costs: "High import costs",
  forex_shortages: "Forex / currency shortages",
  unreliable_suppliers: "Unreliable suppliers",
  counterfeit_products: "Counterfeit / substandard products",
  customs_delays: "Customs delays",
  stockouts: "Frequent stockouts",
  quality_inconsistency: "Inconsistent product quality",
  logistics: "Logistics & transport issues",
  other: "Other",
};

export const REFRIGERANT_AWARENESS = [
  "very_aware",
  "somewhat_aware",
  "heard_of",
  "not_aware",
] as const;

export type RefrigerantAwareness = (typeof REFRIGERANT_AWARENESS)[number];

export const REFRIGERANT_AWARENESS_LABELS: Record<RefrigerantAwareness, string> = {
  very_aware: "Very aware — actively stocking / selling",
  somewhat_aware: "Somewhat aware — know about it",
  heard_of: "Heard of it but not involved",
  not_aware: "Not aware at all",
};
