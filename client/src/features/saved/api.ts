import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, apiMessage, type Paginated } from "@/lib/api";
import type { Job } from "@/lib/types";

type SavedJob = { _id: string; job: Job };

export function useSavedJobs(page = 1) {
  return useQuery({
    queryKey: ["saved", page],
    queryFn: () =>
      unwrap<Paginated<SavedJob>>(
        api.get("/save", { params: { page, size: 20 } }),
      ),
  });
}

export function useUnsave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.delete(`/save/${jobId}`),
    onMutate: async (jobId) => {
      await qc.cancelQueries({ queryKey: ["saved"] });
      const prev = qc.getQueriesData<Paginated<SavedJob>>({ queryKey: ["saved"] });
      qc.setQueriesData<Paginated<SavedJob>>({ queryKey: ["saved"] }, (old) =>
        old
          ? { ...old, docs: old.docs.filter((s) => s.job?._id !== jobId) }
          : old,
      );
      return { prev };
    },
    onError: (e, _id, ctx) => {
      ctx?.prev.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error(apiMessage(e, "Couldn't remove"));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["saved"] });
      qc.invalidateQueries({ queryKey: ["savedIds"] });
    },
  });
}

export function useSavedJobIds(enabled: boolean) {
  return useQuery({
    queryKey: ["savedIds"],
    enabled,
    queryFn: () =>
      unwrap<Paginated<SavedJob>>(
        api.get("/save", { params: { page: 1, size: 100 } }),
      ).then((data) => data.docs.filter((s) => s.job).map((s) => s.job._id)),
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, saved }: { jobId: string; saved: boolean }) =>
      saved ? api.delete(`/save/${jobId}`) : api.post(`/save/${jobId}`),
    onMutate: async ({ jobId, saved }) => {
      await qc.cancelQueries({ queryKey: ["savedIds"] });
      const prev = qc.getQueryData<string[]>(["savedIds"]);
      qc.setQueryData<string[]>(["savedIds"], (old = []) =>
        saved ? old.filter((id) => id !== jobId) : [...old, jobId],
      );
      return { prev };
    },
    onError: (e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["savedIds"], ctx.prev);
      toast.error(apiMessage(e, "Couldn't update saved jobs"));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["saved"] });
      qc.invalidateQueries({ queryKey: ["savedIds"] });
    },
  });
}
