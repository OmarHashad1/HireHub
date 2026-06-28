import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, apiMessage, type Paginated } from "@/lib/api";
import { jobKeys } from "@/features/jobs/api";
import type {
  CompanyProfile,
  Job,
  JobApplicant,
  Interview,
} from "@/lib/types";

export const PAGE_SIZE = 10;

export const recruiterKeys = {
  company: ["recruiter", "company"] as const,
  jobs: (companyId?: string, page = 1) =>
    ["recruiter", "jobs", companyId, page] as const,
  applicants: (jobId: string, page = 1) =>
    ["recruiter", "applicants", jobId, page] as const,
  interviews: (companyId?: string, page = 1) =>
    ["recruiter", "interviews", companyId, page] as const,
};

export type JobPayload = {
  title: string;
  description: string;
  type: string;
  experienceLevel: string;
  requirements?: string[];
  skills?: string[];
  location: { isRemote: boolean; city?: string; country?: string };
  salary?: { min?: number; max?: number; currency?: string };
  deadline?: string | null;
  autoReject?: boolean;
  aiThreshold?: number | null;
  // Only set on create ("draft" | "published"). Status changes after creation
  // go through publish/close/draft endpoints, never a plain update.
  status?: "draft" | "published";
};

// ─── Company profile ────────────────────────────────────────────────────────

export function useMyCompany() {
  return useQuery({
    queryKey: recruiterKeys.company,
    staleTime: 60_000,
    queryFn: () => unwrap<CompanyProfile>(api.get("/company/profile")),
  });
}

export function useUpdateCompanyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch("/company/profile", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.company });
      toast.success("Company profile updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update profile")),
  });
}

export function useUploadCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("logo", file);
      return api.patch("/company/logo", form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.company });
      toast.success("Logo updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't upload logo")),
  });
}

export function useDeleteCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/company/logo"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.company });
      toast.success("Logo removed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't remove logo")),
  });
}

// ─── Jobs ───────────────────────────────────────────────────────────────────

export function useMyJobs(companyId?: string, page = 1, size = PAGE_SIZE) {
  return useQuery({
    queryKey: recruiterKeys.jobs(companyId, page),
    enabled: !!companyId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      unwrap<Paginated<Job>>(
        api.get(`/company/${companyId}/jobs`, { params: { page, size } }),
      ),
  });
}

function useJobInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
    qc.invalidateQueries({ queryKey: jobKeys.all });
  };
}

export function useCreateJob() {
  const invalidate = useJobInvalidation();
  return useMutation({
    mutationFn: (payload: JobPayload) => api.post("/job/jobs", payload),
    onSuccess: () => {
      invalidate();
      toast.success("Job created");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't create job")),
  });
}

export function useUpdateJob() {
  const invalidate = useJobInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JobPayload }) =>
      api.patch(`/job/${id}`, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Job updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update job")),
  });
}

export function usePublishJob() {
  const invalidate = useJobInvalidation();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/job/${id}/publish`),
    onSuccess: () => {
      invalidate();
      toast.success("Job published");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't publish job")),
  });
}

export function useCloseJob() {
  const invalidate = useJobInvalidation();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/job/${id}/close`),
    onSuccess: () => {
      invalidate();
      toast.success("Job closed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't close job")),
  });
}

// Unpublish a published job back to draft via the update endpoint.
export function useDraftJob() {
  const invalidate = useJobInvalidation();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/job/${id}`, { status: "draft" }),
    onSuccess: () => {
      invalidate();
      toast.success("Job moved to draft");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't move job to draft")),
  });
}

export function useDeleteJob() {
  const invalidate = useJobInvalidation();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/job/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Job deleted");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't delete job")),
  });
}

// ─── Applicants ─────────────────────────────────────────────────────────────

export function useJobApplicants(jobId: string, page = 1) {
  return useQuery({
    queryKey: recruiterKeys.applicants(jobId, page),
    enabled: !!jobId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      unwrap<Paginated<JobApplicant>>(
        api.get(`/job/${jobId}/applications`, {
          params: { page, size: PAGE_SIZE },
        }),
      ),
  });
}

export function useUpdateApplication(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        status?: "offer" | "rejected";
        rejectionReason?: string;
        recruiterNotes?: string;
      };
    }) => api.patch(`/application/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "applicants", jobId] });
      toast.success("Application updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update application")),
  });
}

// ─── Interviews ─────────────────────────────────────────────────────────────

export function useCompanyInterviews(
  companyId?: string,
  page = 1,
  size = PAGE_SIZE,
) {
  return useQuery({
    queryKey: recruiterKeys.interviews(companyId, page),
    enabled: !!companyId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      unwrap<Paginated<Interview>>(
        api.get(`/interview/${companyId}`, { params: { page, size } }),
      ),
  });
}

export function useScheduleInterview(jobId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      application: string;
      type: string;
      scheduledAt: string;
    }) => api.post("/interview", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "interviews"] });
      if (jobId)
        qc.invalidateQueries({ queryKey: ["recruiter", "applicants", jobId] });
      toast.success("Interview scheduled");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't schedule interview")),
  });
}

export function useUpdateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        type?: string;
        scheduledAt?: string;
        status?: "cancelled" | "completed";
        cancellationReason?: string;
      };
    }) => api.patch(`/interview/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "interviews"] });
      toast.success("Interview updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update interview")),
  });
}

// ─── Reports (company → user) ───────────────────────────────────────────────

export type FiledReport = {
  _id: string;
  reason: string;
  otherReason?: string | null;
  details?: string | null;
  status: string;
  resolutionNote?: string | null;
  createdAt: string;
};

// File a report against an applicant. `companyId` (the reporting company) is
// required and ownership-checked by the API.
export function useReportUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Record<string, unknown>;
    }) => api.post(`/report/user/${userId}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "reports"] });
      toast.success("Report submitted — our team will review it");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't submit the report")),
  });
}

// Reports this company has filed (targetType: user).
export function useCompanyReports(page = 1) {
  return useQuery({
    queryKey: ["recruiter", "reports", page],
    placeholderData: keepPreviousData,
    queryFn: () =>
      unwrap<Paginated<FiledReport>>(
        api.get("/report/company", { params: { page, size: PAGE_SIZE } }),
      ),
  });
}
