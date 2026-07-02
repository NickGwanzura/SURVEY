export const AGE_GROUPS = [
  "under_25",
  "25_34",
  "35_44",
  "45_54",
  "55_64",
  "65_plus",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  under_25: "Under 25",
  "25_34": "25-34",
  "35_44": "35-44",
  "45_54": "45-54",
  "55_64": "55-64",
  "65_plus": "65 and over",
};

export const YEARS_EXPERIENCE = [
  "less_than_1",
  "1_3",
  "4_6",
  "7_10",
  "11_15",
  "16_20",
  "more_than_20",
] as const;

export type YearsExperience = (typeof YEARS_EXPERIENCE)[number];

export const YEARS_EXPERIENCE_LABELS: Record<YearsExperience, string> = {
  less_than_1: "Less than 1 year",
  "1_3": "1-3 years",
  "4_6": "4-6 years",
  "7_10": "7-10 years",
  "11_15": "11-15 years",
  "16_20": "16-20 years",
  more_than_20: "More than 20 years",
};

export const GENDERS = ["male", "female", "prefer_not_to_say"] as const;
export type Gender = (typeof GENDERS)[number];
export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};
