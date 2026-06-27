"use client";

import { Flag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap, type Paginated } from "@/lib/api";
import { relativeTime, titleCase } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/States";

type Report = {
  _id: string;
  reason: string;
  otherReason?: string | null;
  details?: string | null;
  status: string;
  resolutionNote?: string | null;
  createdAt: string;
};

export default function ReportsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "user"],
    queryFn: () =>
      unwrap<Paginated<Report>>(api.get("/report/user", { params: { page: 1, size: 20 } })),
  });
  const reports = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Reports"
        subtitle="Companies you've reported and their review status."
      />

      {isLoading && <CardSkeleton count={3} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && reports.length === 0 && (
        <EmptyState
          icon={Flag}
          title="No reports filed"
          description="If a company posts a fake or misleading role, you can report it from the job detail."
        />
      )}

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
            <p className="mt-2 text-[12px] text-ink-tertiary">
              Filed {relativeTime(r.createdAt)}
            </p>
            {r.resolutionNote && (
              <p className="mt-2 rounded-md border border-hairline bg-surface-2/40 px-3 py-2 text-[13px] text-ink-muted">
                Resolution: {r.resolutionNote}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
