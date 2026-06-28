export const ROLE = ["user", "company", "admin"] as const;
export const USER_STATUS = ["active", "deleted", "banned"] as const;
export const LOGOUT_TYPE = ["all", "device"] as const;
export const EDUCATION_LEVEL = [
  "high-school",
  "bachelor",
  "master",
  "phd",
  "diploma",
  "other",
] as const;
export type EducationLevel = (typeof EDUCATION_LEVEL)[number];

export const JOB_STATUS = [
  "draft",
  "published",
  "closed",
  "expired",
  "suspended",
  "flagged",
] as const;
export const JOB_TYPE = ["full-time", "part-time", "remote", "internship"] as const;
export const EXPERIENCE_LEVEL = [
  "fresh",
  "junior",
  "mid",
  "senior",
  "lead",
  "manager",
] as const;
export const CURRENCY = ["EGP", "USD", "EUR", "SAR", "AED"] as const;

export const APPLICATION_STATUS = [
  "applied",
  "reviewed",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;
export const INTERVIEW_TYPE = ["online", "in_person"] as const;
export const INTERVIEW_STATUS = [
  "scheduled",
  "completed",
  "cancelled",
  "missed",
] as const;

export const COMPANY_STATUS = ["pending_activation", "active", "suspended"] as const;
export const COMPANY_APPLICATION_STATUS = ["pending", "approved", "rejected"] as const;
export const INDUSTRY = [
  "tech",
  "finance",
  "healthcare",
  "education",
  "retail",
  "real_estate",
  "manufacturing",
  "media",
  "other",
] as const;
export const COMPANY_SIZE = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;
export const COMPANY_BENEFIT = [
  "health_insurance",
  "social_insurance",
  "remote_work",
  "flexible_hours",
  "annual_bonus",
  "profit_sharing",
  "transportation_allowance",
  "meal_allowance",
  "training_and_development",
  "gym_membership",
  "childcare_support",
  "work_from_home",
  "open_vacation_policy",
] as const;

export const REPORT_STATUS = ["pending", "resolved", "dismissed"] as const;
export const REPORT_REASON = [
  "fake_job",
  "scam_company",
  "harassment_by_company",
  "unpaid_work",
  "misleading_job_description",
  "fake_profile",
  "inappropriate_behavior",
  "spamming",
  "other",
] as const;

export const APPLICANT_REPORT_REASON = [
  "fake_profile",
  "inappropriate_behavior",
  "spamming",
  "other",
] as const;

export const EDUCATION_LABEL: Record<(typeof EDUCATION_LEVEL)[number], string> = {
  "high-school": "High school",
  bachelor: "Bachelor",
  master: "Master",
  phd: "PhD",
  diploma: "Diploma",
  other: "Other",
};
