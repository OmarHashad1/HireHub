"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { useAdminApplications } from "@/features/admin/api";
import { relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";

function jobTitle(job: unknown): string {
  if (job && typeof job === "object" && "title" in job) {
    return String((job as { title?: string }).title ?? "Job");
  }
  return "Job";
}

export default function AdminApplicationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminApplications(page);
  const applications = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Applications"
        subtitle="All job applications across the platform."
      />

      {isLoading && <CardSkeleton count={4} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && applications.length === 0 && (
        <EmptyState icon={FileText} title="No applications" />
      )}

      {applications.length > 0 && (
        <>
          <div className="space-y-2">
            {applications.map((a) => (
              <div
                key={a._id}
                className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-1 p-3 sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">
                      {jobTitle(a.job)}
                    </p>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="text-[12px] text-ink-subtle">
                    Applied {relativeTime(a.createdAt)}
                  </p>
                </div>
                {a.aiRating != null && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[12px] text-primary-hover">
                    <Sparkles className="size-3.5" />
                    {a.aiRating}
                  </span>
                )}
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            pages={data?.meta.pages ?? 1}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}
