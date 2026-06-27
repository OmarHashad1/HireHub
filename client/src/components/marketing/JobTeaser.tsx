"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useJobs } from "@/features/jobs/api";
import { JobCard } from "@/components/JobCard";
import { ButtonLink } from "@/components/ui/Button";

export function JobTeaser() {
  const router = useRouter();
  const { data, isLoading, isError } = useJobs({});
  const jobs = data?.pages.flatMap((p) => p.docs).slice(0, 6) ?? [];

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-primary-hover">Live on HireHub</p>
          <h2 className="mt-2 text-display-md text-balance">
            Roles open right now
          </h2>
        </div>
        <ButtonLink href="/jobs" variant="secondary" size="md" className="group">
          Browse all
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-lg border border-hairline bg-surface-1"
            />
          ))}

        {isError && (
          <div className="col-span-full rounded-lg border border-hairline bg-surface-1 p-8 text-center text-sm text-ink-subtle">
            Couldn&apos;t reach the job feed. The server may be waking up — try
            again in a moment.
          </div>
        )}

        {!isLoading &&
          !isError &&
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onSelect={() => router.push(`/jobs?selected=${job._id}`)}
            />
          ))}

        {!isLoading && !isError && jobs.length === 0 && (
          <div className="col-span-full rounded-lg border border-hairline bg-surface-1 p-10 text-center text-sm text-ink-subtle">
            No published roles yet — check back soon.
          </div>
        )}
      </div>
    </section>
  );
}
