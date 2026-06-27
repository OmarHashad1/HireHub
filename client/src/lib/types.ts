export const JOB_TYPE = ["full-time", "part-time", "remote", "internship"] as const;
export const EXPERIENCE_LEVEL = ["fresh", "junior", "mid", "senior", "lead", "manager"] as const;
export const JOB_STATUS = ["draft", "published", "closed", "expired", "suspended", "flagged"] as const;
export const APPLICATION_STATUS = ["applied", "reviewed", "interview", "offer", "rejected", "withdrawn"] as const;
export const INTERVIEW_STATUS = ["scheduled", "completed", "cancelled", "missed"] as const;
export const COMPANY_STATUS = ["pending_activation", "active", "suspended"] as const;
export const CURRENCY = ["EGP", "USD", "EUR", "SAR", "AED"] as const;

export type JobType = (typeof JOB_TYPE)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[number];
export type JobStatus = (typeof JOB_STATUS)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export type CompanyRef =
  | string
  | {
      _id: string;
      name?: string;
      logo?: string | null;
      industry?: string;
    };

export type Job = {
  _id: string;
  company: CompanyRef;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: ExperienceLevel;
  type: JobType;
  location: { isRemote: boolean; city?: string | null; country?: string | null };
  salary?: { min?: number | null; max?: number | null; currency?: string | null };
  deadline?: string | null;
  applicantsCount: number;
  aiThreshold?: number | null;
  autoReject: boolean;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = {
  fresh: "Fresh",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  manager: "Manager",
};

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
  internship: "Internship",
};

export function companyName(company: CompanyRef): string | undefined {
  return typeof company === "object" ? company.name : undefined;
}

export function companyId(company: CompanyRef): string {
  return typeof company === "object" ? company._id : company;
}

export function companyLogo(company: CompanyRef): string | null | undefined {
  return typeof company === "object" ? company.logo : undefined;
}

// ─── Labels for the recruiter / company workspace ───────────────────────────

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
  expired: "Expired",
  suspended: "Suspended",
  flagged: "Flagged",
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  reviewed: "Reviewed",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export type InterviewType = "online" | "in_person";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "missed";

export const INTERVIEW_TYPE_LABEL: Record<InterviewType, string> = {
  online: "Online",
  in_person: "In person",
};

export const INTERVIEW_STATUS_LABEL: Record<InterviewStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  missed: "Missed",
};

export const INDUSTRY_LABEL: Record<string, string> = {
  tech: "Technology",
  finance: "Finance",
  healthcare: "Healthcare",
  education: "Education",
  retail: "Retail",
  real_estate: "Real estate",
  manufacturing: "Manufacturing",
  media: "Media",
  other: "Other",
};

export const BENEFIT_LABEL: Record<string, string> = {
  health_insurance: "Health insurance",
  social_insurance: "Social insurance",
  remote_work: "Remote work",
  flexible_hours: "Flexible hours",
  annual_bonus: "Annual bonus",
  profit_sharing: "Profit sharing",
  transportation_allowance: "Transport allowance",
  meal_allowance: "Meal allowance",
  training_and_development: "Training & development",
  gym_membership: "Gym membership",
  childcare_support: "Childcare support",
  work_from_home: "Work from home",
  open_vacation_policy: "Open vacation policy",
};

export function labelize(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Recruiter domain types ─────────────────────────────────────────────────

export type CompanyProfile = {
  _id: string;
  name: string;
  email?: string;
  logo?: string | null;
  coverImage?: string | null;
  industry: string;
  size: string;
  status: "pending_activation" | "active" | "suspended";
  location?: { city?: string | null; country?: string | null } | null;
  description: string;
  website?: string | null;
  benefits?: string[];
  socialMedia?: {
    twitter?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  } | null;
  foundedAt?: string | null;
  createdAt: string;
};

export type ApplicantRef =
  | string
  | {
      _id: string;
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
      headline?: string | null;
      email?: string;
    };

export type JobApplicant = {
  _id: string;
  job: string;
  applicant: ApplicantRef;
  cv: string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  rejectionReason?: string | null;
  recruiterNotes?: string | null;
  aiRating?: number | null;
  aiNotes?: string | null;
  autoRejected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Interview = {
  _id: string;
  application: string;
  company: string;
  job: string | { _id: string; title?: string };
  applicant: ApplicantRef;
  type: InterviewType;
  scheduledAt: string;
  status: InterviewStatus;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
};

export function applicantName(ref: ApplicantRef): string {
  if (typeof ref === "object") {
    const name = [ref.firstName, ref.lastName].filter(Boolean).join(" ");
    return name || "Applicant";
  }
  return "Applicant";
}
