export const MAIN_WORK_FOCUS = [
  "domestic_ac",
  "commercial_ac",
  "industrial_refrigeration",
  "commercial_refrigeration",
  "mobile_ac",
  "heat_pumps",
  "cold_chain",
  "general_hvacr",
  "other",
] as const;

export type MainWorkFocus = (typeof MAIN_WORK_FOCUS)[number];

export const MAIN_WORK_FOCUS_LABELS: Record<MainWorkFocus, string> = {
  domestic_ac: "Domestic Air Conditioning",
  commercial_ac: "Commercial Air Conditioning",
  industrial_refrigeration: "Industrial Refrigeration",
  commercial_refrigeration:
    "Commercial Refrigeration (cold rooms, supermarkets)",
  mobile_ac: "Mobile Air Conditioning (vehicles)",
  heat_pumps: "Heat Pumps",
  cold_chain: "Cold Chain (transport refrigeration)",
  general_hvacr: "General HVAC-R servicing (mixed)",
  other: "Other (specify)",
};
