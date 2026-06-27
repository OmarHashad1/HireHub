import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, apiMessage, type Paginated } from "@/lib/api";
import type { Application } from "@/lib/session";
import { jobKeys } from "@/features/jobs/api";

export function useMyApplications(page = 1) {
  return useQuery({
    queryKey: ["applications", "me", page],
    queryFn: () =>
      unwrap<Paginated<Application>>(
        api.get("/application/me", { params: { page, size: 20 } }),
      ),
  });
}

function jobIdOf(application: Application): string {
  return typeof application.job === "object"
    ? application.job._id
    : application.job;
}

export function useAppliedJobIds(enabled: boolean) {
  return useQuery({
    queryKey: ["appliedIds"],
    enabled,
    queryFn: () =>
      unwrap<Paginated<Application>>(
        api.get("/application/me", { params: { page: 1, size: 100 } }),
      ).then((data) => data.docs.map(jobIdOf)),
  });
}

export function useApply(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { coverLetter?: string; cv?: File }) => {
      const form = new FormData();
      if (input.coverLetter) form.append("coverLetter", input.coverLetter);
      if (input.cv) form.append("cv", input.cv);
      return api.post(`/job/${jobId}/application`, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "me"] });
      qc.invalidateQueries({ queryKey: ["appliedIds"] });
      // Refresh applicantsCount on the listing + detail.
      qc.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/application/${id}/withdraw`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "me"] });
      // Withdrawal decrements the job's applicantsCount server-side.
      qc.invalidateQueries({ queryKey: jobKeys.all });
      toast.success("Application withdrawn");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't withdraw")),
  });
}
