export const TRADITIONAL_REFRIGERANTS = [
  "R-22",
  "R-134a",
  "R-404A",
  "R-410A",
] as const;

export const LOW_GWP_REFRIGERANTS = [
  "R-290",
  "R-744",
  "R-32",
  "R-1234yf",
] as const;

export const CERTIFICATION_TYPES = [
  "hevacraz_membership",
  "national_trade_test",
  "city_and_guilds",
  "manufacturer_specific",
  "international",
  "other",
] as const;

export type CertificationType = (typeof CERTIFICATION_TYPES)[number];

export const CERTIFICATION_TYPE_LABELS: Record<CertificationType, string> = {
  hevacraz_membership: "HEVACRAZ Membership",
  national_trade_test: "National Trade Test (Class 1, 2, 3, 4)",
  city_and_guilds: "City and Guilds",
  manufacturer_specific: "Manufacturer-specific certification",
  international: "International certification",
  other: "Other",
};

export const HAS_CERTIFICATION_OPTIONS = ["yes", "no", "studying"] as const;
export type HasCertification = (typeof HAS_CERTIFICATION_OPTIONS)[number];
export const HAS_CERTIFICATION_LABELS: Record<HasCertification, string> = {
  yes: "Yes",
  no: "No",
  studying: "Currently studying for one",
};
