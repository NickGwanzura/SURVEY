export const EDUCATION_LEVELS = [
  "none",
  "primary",
  "o_level",
  "a_level",
  "vocational",
  "diploma",
  "degree",
  "postgraduate",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  none: "No formal education",
  primary: "Primary school",
  o_level: "Ordinary Level (O-Level)",
  a_level: "Advanced Level (A-Level)",
  vocational: "Vocational training certificate",
  diploma: "Diploma",
  degree: "Degree",
  postgraduate: "Postgraduate qualification",
};
