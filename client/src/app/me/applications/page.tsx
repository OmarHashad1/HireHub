"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useMyApplications, useWithdrawApplication } from "@/features/applications/api";
import { relativeTime } from "@/lib/utils";
import type { Application } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const WITHDRAWABLE = new Set(["applied", "reviewed", "interview"]);

function jobTitle(job: Application["job"]) {
  return typeof job === "object" ? job.title ?? "Role" : "Role";
}

export default function ApplicationsPage() {
  const { data, isLoading, isError, refetch } = useMyApplications();
  const withdraw = useWithdrawApplication();
  const [target, setTarget] = useState<string | null>(null);
  const applications = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My applications"
        subtitle="Track every role you've applied to."
      />

      {isLoading && <CardSkeleton count={4} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && applications.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Browse open roles and apply — they'll show up here with their live status."
          action={<ButtonLink href="/jobs">Find jobs</ButtonLink>}
        />
      )}

      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app._id}
            className="rounded-lg border border-hairline bg-surface-1 p-4 sm:p-5"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface-3 text-ink-subtle">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-ink">
                    {jobTitle(app.job)}
                  </h3>
                  <StatusPill status={app.status} />
                </div>
                <p className="mt-1 text-[12px] text-ink-tertiary">
                  Applied {relativeTime(app.createdAt)}
                </p>
                {app.rejectionReason && (
                  <p className="mt-2 text-[13px] text-ink-subtle">
                    Reason: {app.rejectionReason}
                  </p>
                )}
              </div>
              {WITHDRAWABLE.has(app.status) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTarget(app._id)}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) withdraw.mutate(target);
          setTarget(null);
        }}
        title="Withdraw application?"
        description="The recruiter will no longer consider this application."
        confirmLabel="Withdraw"
        destructive
        loading={withdraw.isPending}
      />
    </div>
  );
}
