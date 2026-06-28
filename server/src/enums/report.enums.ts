export enum REPORT_STATUS {
  PENDING = "pending",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum REPORT_TARGET_TYPE {
  COMPANY = "company",
  USER = "user",
}

export enum REPORT_REASON {
  FAKE_JOB = "fake_job",
  SCAM_COMPANY = "scam_company",
  HARASSMENT_BY_COMPANY = "harassment_by_company",
  UNPAID_WORK = "unpaid_work",
  MISLEADING_JOB_DESCRIPTION = "misleading_job_description",
  FAKE_PROFILE = "fake_profile",
  INAPPROPRIATE_BEHAVIOR = "inappropriate_behavior",
  SPAMMING = "spamming",
  OTHER = "other",
}


export const APPLICANT_REPORT_REASON = [
  REPORT_REASON.FAKE_PROFILE,
  REPORT_REASON.INAPPROPRIATE_BEHAVIOR,
  REPORT_REASON.SPAMMING,
  REPORT_REASON.OTHER,
] as const;
