export type Role = "user" | "company" | "admin";

export type SessionUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  avatar?: string | null;
  role: Role;
  phoneNumber?: string | null;
  socialMedia?: {
    linkedin?: string | null;
    github?: string | null;
    leetcode?: string | null;
    portfolio?: string | null;
  };
  bio?: string | null;
  headline?: string | null;
  cv?: string | null;
  skills: string[];
};

export type Experience = {
  _id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
};

export type Education = {
  _id: string;
  level: string;
  institution: string;
  field: string;
  from: string;
  to: string;
};

export type FullProfile = SessionUser & {
  experience: Experience[];
  education: Education[];
};

export type ApplicationStatus =
  | "applied"
  | "reviewed"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type Application = {
  _id: string;
  job:
    | string
    | { _id: string; title?: string; company?: string; type?: string };
  applicant: string;
  cv: string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  rejectionReason?: string | null;
  recruiterNotes?: string | null;
  aiRating?: number | null;
  aiNotes?: string | null;
  autoRejected: boolean;
  hadInterview: boolean;
  withdrawnAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const homeForRole: Record<Role, string> = {
  user: "/me",
  company: "/recruiter",
  admin: "/admin",
};
