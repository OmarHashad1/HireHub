import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { api, unwrap, type Paginated } from "@/lib/api";
import type { Job } from "@/lib/types";

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: Record<string, unknown>) =>
    [...jobKeys.all, "list", filters] as const,
  detail: (id: string) => [...jobKeys.all, "detail", id] as const,
};

export type JobFilters = {
  type?: string;
  experienceLevel?: string;
  isRemote?: boolean;
  search?: string;
};

const PAGE_SIZE = 12;

function matchesFilters(job: Job, filters: JobFilters) {
  if (filters.type && job.type !== filters.type) return false;
  if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel)
    return false;
  if (filters.isRemote && !job.location.isRemote) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = [
      job.title,
      job.description,
      ...job.skills,
      job.location.city ?? "",
      job.location.country ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export function useJobs(filters: JobFilters) {
  return useInfiniteQuery({
    queryKey: jobKeys.list(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await unwrap<Paginated<Job>>(
        api.get("/job/jobs", { params: { page: pageParam, size: PAGE_SIZE } }),
      );
      return {
        docs: data.docs.filter((job) => matchesFilters(job, filters)),
        page: pageParam,
        pages: data.meta.pages ?? pageParam,
      };
    },
    getNextPageParam: (last) =>
      last.page < last.pages ? last.page + 1 : undefined,
  });
}

export function useJob(id: string | null) {
  return useQuery({
    queryKey: jobKeys.detail(id ?? ""),
    enabled: !!id,
    staleTime: 60_000,
    queryFn: () => unwrap<Job>(api.get(`/job/${id}`)),
  });
}
