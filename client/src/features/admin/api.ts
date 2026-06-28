import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, apiMessage, type Paginated } from "@/lib/api";
import type { Job } from "@/lib/types";
import type { Application, Experience, Education } from "@/lib/session";

export const ADMIN_PAGE_SIZE = 15;

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  users: (page: number) => ["admin", "users", page] as const,
  companies: (page: number) => ["admin", "companies", page] as const,
  companyApplications: (page: number) =>
    ["admin", "company-applications", page] as const,
  jobs: (page: number) => ["admin", "jobs", page] as const,
  applications: (page: number) => ["admin", "applications", page] as const,
  reports: (page: number) => ["admin", "reports", page] as const,
  logs: (page: number) => ["admin", "logs", page] as const,
};

// ─── Types ──────────────────────────────────────────────────────────────────

export type AdminStats = {
  users: number;
  companies: number;
  jobs: number;
  applications: number;
  reports: number;
  pendingCompanyApplications: number;
  pendingReports: number;
  jobsByStatus: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  reportsByStatus: Record<string, number>;
};

export type AdminUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  headline?: string | null;
  avatar?: string | null;
  banReason?: string | null;
  createdAt: string;
};

export type AdminCompany = {
  _id: string;
  name: string;
  email?: string;
  industry: string;
  size: string;
  status: string;
  suspend_reason?: string | null;
  logo?: string | null;
  createdAt: string;
};

export type CompanyApplication = {
  _id: string;
  companyName: string;
  companyEmail: string;
  contactPhone?: string;
  website?: string | null;
  linkedin?: string | null;
  industry: string;
  size: string;
  location?: { city?: string; country?: string };
  description: string;
  documents?: { commercialRegistration?: string; taxCard?: string };
  status: string;
  rejectionReason?: string | null;
  foundedAt?: string | null;
  createdAt: string;
};

export type AdminReport = {
  _id: string;
  reportedBy: string;
  targetType: string;
  targetId: string;
  reason: string;
  otherReason?: string | null;
  details?: string | null;
  status: string;
  resolutionNote?: string | null;
  createdAt: string;
};

export type LogEntry = {
  _id: string;
  level?: number;
  action?: string;
  event?: string;
  email?: string;
  message?: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function usePaginatedList<T>(
  key: readonly unknown[],
  url: string,
  page: number,
) {
  return useQuery({
    queryKey: key,
    placeholderData: keepPreviousData,
    queryFn: () =>
      unwrap<Paginated<T>>(
        api.get(url, { params: { page, size: ADMIN_PAGE_SIZE } }),
      ),
  });
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => unwrap<AdminStats>(api.get("/admin/stats")),
  });
}

// ─── Users ──────────────────────────────────────────────────────────────────

export function useAdminUsers(page: number) {
  return usePaginatedList<AdminUser>(adminKeys.users(page), "/admin/users", page);
}

export type AdminUserDetail = AdminUser & {
  phoneNumber?: string | null;
  age?: number | null;
  bio?: string | null;
  skills?: string[];
  provider?: string;
  isEmailVerified?: boolean;
  socialMedia?: {
    linkedin?: string | null;
    github?: string | null;
    leetcode?: string | null;
    portfolio?: string | null;
  } | null;
  experience?: Experience[];
  education?: Education[];
};

export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: ["admin", "user", id],
    enabled: !!id,
    queryFn: () => unwrap<AdminUserDetail>(api.get(`/admin/users/${id}`)),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      banReason,
    }: {
      id: string;
      status: "active" | "banned";
      banReason?: string;
    }) =>
      api.patch(`/admin/users/${id}`, {
        status,
        ...(banReason ? { banReason } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update user")),
  });
}

// ─── Companies ──────────────────────────────────────────────────────────────

export function useAdminCompanies(page: number) {
  return usePaginatedList<AdminCompany>(
    adminKeys.companies(page),
    "/admin/companies",
    page,
  );
}

export type AdminCompanyDetail = AdminCompany & {
  email?: string;
  description?: string;
  website?: string | null;
  foundedAt?: string | null;
  benefits?: string[];
  location?: { city?: string | null; country?: string | null } | null;
  socialMedia?: {
    twitter?: string | null;
    linkedin?: string | null;
    facebook?: string | null;
    instagram?: string | null;
  } | null;
};

export function useAdminCompany(id?: string) {
  return useQuery({
    queryKey: ["admin", "company", id],
    enabled: !!id,
    queryFn: () => unwrap<AdminCompanyDetail>(api.get(`/admin/companies/${id}`)),
  });
}

export function useUpdateCompanyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      suspendReason,
    }: {
      id: string;
      status: "active" | "suspended";
      suspendReason?: string;
    }) =>
      api.patch(`/admin/companies/${id}`, {
        status,
        ...(suspendReason ? { suspendReason } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
      toast.success("Company updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update company")),
  });
}

// ─── Company applications ───────────────────────────────────────────────────

export function useCompanyApplications(page: number) {
  return usePaginatedList<CompanyApplication>(
    adminKeys.companyApplications(page),
    "/admin/company-applications",
    page,
  );
}

export function useReviewCompanyApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationID,
      status,
      rejectionReason,
    }: {
      applicationID: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    }) =>
      api.patch("/admin/application", {
        applicationID,
        status,
        ...(rejectionReason ? { rejectionReason } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "company-applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
      toast.success("Application reviewed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't review application")),
  });
}

// ─── Jobs ───────────────────────────────────────────────────────────────────

export function useAdminJobs(page: number) {
  return usePaginatedList<Job>(adminKeys.jobs(page), "/admin/jobs", page);
}

export function useModerateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "flagged" | "published";
    }) => api.patch(`/admin/jobs/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Job updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update job")),
  });
}

// ─── Applications (read-only) ───────────────────────────────────────────────

export function useAdminApplications(page: number) {
  return usePaginatedList<Application>(
    adminKeys.applications(page),
    "/admin/applications",
    page,
  );
}

// ─── Reports ────────────────────────────────────────────────────────────────

export function useAdminReports(page: number) {
  return usePaginatedList<AdminReport>(
    adminKeys.reports(page),
    "/admin/reports",
    page,
  );
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
    }: {
      id: string;
      status: "resolved" | "dismissed";
      resolutionNote?: string;
    }) =>
      api.patch(`/admin/reports/${id}`, {
        status,
        ...(resolutionNote ? { resolutionNote } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast.success("Report updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update report")),
  });
}

// ─── Logs (read-only) ───────────────────────────────────────────────────────

export function useAdminLogs(page: number) {
  return usePaginatedList<LogEntry>(adminKeys.logs(page), "/admin/logs", page);
}
