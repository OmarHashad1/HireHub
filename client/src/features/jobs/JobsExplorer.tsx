"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SearchX } from "lucide-react";
import { toast } from "sonner";
import { useJobs, useJob, type JobFilters } from "@/features/jobs/api";
import { useSavedJobIds, useToggleSave } from "@/features/saved/api";
import { useAppliedJobIds } from "@/features/applications/api";
import { useSession } from "@/lib/auth";
import { JobCard } from "@/components/JobCard";
import { JobDetail } from "@/features/jobs/JobDetail";
import { FilterBar } from "@/features/jobs/FilterBar";

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-lg border border-hairline bg-surface-1"
        />
      ))}
    </div>
  );
}

export function JobsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = params.get("selected");

  const [filters, setFilters] = useState<JobFilters>({});

  const { data: user } = useSession();
  const canSave = user?.role === "user";
  const { data: savedIdList } = useSavedJobIds(!!canSave);
  const savedIds = useMemo(() => new Set(savedIdList ?? []), [savedIdList]);
  const toggleSaveMutation = useToggleSave();
  const { data: appliedIdList } = useAppliedJobIds(!!canSave);
  const appliedIds = useMemo(() => new Set(appliedIdList ?? []), [appliedIdList]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJobs(filters);

  const jobs = useMemo(
    () => data?.pages.flatMap((p) => p.docs) ?? [],
    [data],
  );

  const detail = useJob(selected);
  const selectedJob =
    detail.data ?? jobs.find((j) => j._id === selected) ?? null;

  const setSelected = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (id) next.set("selected", id);
      else next.delete("selected");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  useEffect(() => {
    if (!selected && jobs.length > 0 && window.innerWidth >= 1024) {
      setSelected(jobs[0]._id);
    }
  }, [selected, jobs, setSelected]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleSave = (id: string) => {
    if (!user) {
      router.push("/login?from=/jobs");
      return;
    }
    if (!canSave) {
      toast.info("Only job seekers can save jobs");
      return;
    }
    toggleSaveMutation.mutate({ jobId: id, saved: savedIds.has(id) });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          Find your next role
        </h1>
        <p className="mt-1 text-sm text-ink-subtle">
          {jobs.length > 0
            ? `${jobs.length} role${jobs.length === 1 ? "" : "s"} matching your search`
            : "Browse every published role on HireHub"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="sticky top-14 z-20 -mx-4 bg-canvas/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:px-0">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>

          <div className="mt-4 space-y-3">
            {isLoading && <ListSkeleton />}

            {isError && (
              <div className="rounded-lg border border-hairline bg-surface-1 p-8 text-center">
                <p className="text-sm text-ink-muted">
                  Couldn&apos;t load jobs. The server may be waking up.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 text-sm font-medium text-primary-hover hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && jobs.length === 0 && (
              <div className="rounded-lg border border-hairline bg-surface-1 p-10 text-center">
                <SearchX className="mx-auto size-7 text-ink-tertiary" />
                <p className="mt-3 text-sm text-ink-muted">
                  No roles match these filters.
                </p>
                <button
                  onClick={() => setFilters({})}
                  className="mt-2 text-sm font-medium text-primary-hover hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                selected={job._id === selected}
                onSelect={() => setSelected(job._id)}
                saved={savedIds.has(job._id)}
                onToggleSave={() => toggleSave(job._id)}
                applied={appliedIds.has(job._id)}
              />
            ))}

            <div ref={sentinel} />
            {isFetchingNextPage && (
              <div className="py-4 text-center text-sm text-ink-subtle">
                Loading more…
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-[88px] h-[calc(100dvh-112px)] overflow-hidden rounded-xl border border-hairline bg-surface-1">
            {selectedJob ? (
              <JobDetail
                job={selectedJob}
                saved={savedIds.has(selectedJob._id)}
                onToggleSave={() => toggleSave(selectedJob._id)}
                applied={appliedIds.has(selectedJob._id)}
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center text-sm text-ink-subtle">
                Select a role to see the details.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-canvas lg:hidden"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <JobDetail
                job={selectedJob}
                saved={savedIds.has(selectedJob._id)}
                onToggleSave={() => toggleSave(selectedJob._id)}
                applied={appliedIds.has(selectedJob._id)}
                onClose={() => setSelected(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
