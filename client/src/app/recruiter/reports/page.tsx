"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useCompanyReports } from "@/features/recruiter/api";
import { relativeTime, titleCase } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/States";

export default function RecruiterReportsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useCompanyReports(page);
  const reports = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Reports"
        subtitle="Applicants you've reported and their review status."
      />

      {isLoading && <CardSkeleton count={3} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && reports.length === 0 && (
        <EmptyState
          icon={Flag}
          title="No reports filed"
          description="If an applicant is abusive or fraudulent, you can report them from a job's applicants list."
        />
      )}

      {reports.length > 0 && (
        <>
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r._id}
                className="rounded-lg border border-hairline bg-surface-1 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[15px] font-medium text-ink">
                    {titleCase(r.reason)}
                  </h3>
                  <StatusPill status={r.status} />
                </div>
                {r.details && (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                    {r.details}
                  </p>
                )}
                {r.resolutionNote && (
                  <p className="mt-2 rounded-md border border-hairline bg-surface-2/40 p-3 text-[12px] text-ink-muted">
                    <span className="font-medium text-ink-subtle">
                      Moderator:{" "}
                    </span>
                    {r.resolutionNote}
                  </p>
                )}
                <p className="mt-2 text-[12px] text-ink-tertiary">
                  Filed {relativeTime(r.createdAt)}
                </p>
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
