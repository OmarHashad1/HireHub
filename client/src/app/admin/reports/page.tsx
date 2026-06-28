"use client";

import { useState } from "react";
import { Flag, Check, X } from "lucide-react";
import {
  useAdminReports,
  useResolveReport,
  type AdminReport,
} from "@/features/admin/api";
import { relativeTime, titleCase } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { ReasonDialog } from "@/components/ui/ReasonDialog";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";

export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminReports(page);
  const resolve = useResolveReport();

  const [acting, setActing] = useState<{
    report: AdminReport;
    status: "resolved" | "dismissed";
  } | null>(null);

  const reports = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Reports"
        subtitle="Review and act on abuse reports."
      />

      {isLoading && <CardSkeleton count={3} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && reports.length === 0 && (
        <EmptyState icon={Flag} title="No reports" />
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-medium text-ink">
                      {titleCase(r.reason)}
                    </h3>
                    <span className="text-[11px] text-ink-tertiary">
                      against {r.targetType}
                    </span>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                {r.otherReason && (
                  <p className="mt-2 text-[13px] text-ink-muted">
                    {r.otherReason}
                  </p>
                )}
                {r.details && (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                    {r.details}
                  </p>
                )}
                {r.resolutionNote && (
                  <p className="mt-2 rounded-md border border-hairline bg-surface-2/40 p-3 text-[12px] text-ink-muted">
                    <span className="font-medium text-ink-subtle">
                      Resolution:{" "}
                    </span>
                    {r.resolutionNote}
                  </p>
                )}
                <p className="mt-2 text-[12px] text-ink-tertiary">
                  Filed {relativeTime(r.createdAt)}
                </p>

                {r.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
                    <Button
                      size="sm"
                      onClick={() => setActing({ report: r, status: "resolved" })}
                      disabled={resolve.isPending}
                    >
                      <Check className="size-3.5" />
                      Resolve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setActing({ report: r, status: "dismissed" })
                      }
                      disabled={resolve.isPending}
                    >
                      <X className="size-3.5" />
                      Dismiss
                    </Button>
                  </div>
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

      {acting && (
        <ReasonDialog
          title={
            acting.status === "resolved" ? "Resolve report?" : "Dismiss report?"
          }
          description={
            acting.status === "resolved"
              ? "Mark this report as actioned."
              : "Mark this report as not actionable."
          }
          label="Resolution note (optional)"
          placeholder="Add context for the record."
          confirmLabel={acting.status === "resolved" ? "Resolve" : "Dismiss"}
          loading={resolve.isPending}
          onClose={() => setActing(null)}
          onConfirm={(note) =>
            resolve.mutate(
              {
                id: acting.report._id,
                status: acting.status,
                resolutionNote: note || undefined,
              },
              { onSuccess: () => setActing(null) },
            )
          }
        />
      )}
    </div>
  );
}
