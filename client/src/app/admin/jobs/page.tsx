"use client";

import { useState } from "react";
import { Briefcase, Flag, Check, MapPin, Users } from "lucide-react";
import {
  useAdminJobs,
  useModerateJob,
} from "@/features/admin/api";
import { type Job, JOB_TYPE_LABEL } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminJobs(page);
  const moderate = useModerateJob();

  const [flagging, setFlagging] = useState<Job | null>(null);
  const [unflagging, setUnflagging] = useState<Job | null>(null);

  const jobs = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Jobs"
        subtitle="Moderate listings across the platform."
      />

      {isLoading && <CardSkeleton count={4} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && jobs.length === 0 && (
        <EmptyState icon={Briefcase} title="No jobs found" />
      )}

      {jobs.length > 0 && (
        <>
          <div className="space-y-2">
            {jobs.map((job) => {
              const place = job.location.isRemote
                ? "Remote"
                : [job.location.city, job.location.country]
                    .filter(Boolean)
                    .join(", ") || "On-site";
              return (
                <div
                  key={job._id}
                  className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-1 p-3 sm:p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink">
                        {job.title}
                      </p>
                      <StatusPill status={job.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-subtle">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {place}
                      </span>
                      <span>{JOB_TYPE_LABEL[job.type]}</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {job.applicantsCount}
                      </span>
                      <span className="text-ink-tertiary">
                        {relativeTime(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  {job.status === "flagged" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUnflagging(job)}
                      disabled={moderate.isPending}
                    >
                      <Check className="size-3.5" />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setFlagging(job)}
                      disabled={moderate.isPending}
                      className="text-error hover:text-error"
                    >
                      <Flag className="size-3.5" />
                      Flag
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            pages={data?.meta.pages ?? 1}
            onPage={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={flagging !== null}
        onClose={() => setFlagging(null)}
        onConfirm={() => {
          if (flagging)
            moderate.mutate(
              { id: flagging._id, status: "flagged" },
              { onSuccess: () => setFlagging(null) },
            );
        }}
        title="Flag this job?"
        description="It's hidden from the public board pending review."
        confirmLabel="Flag job"
        destructive
        loading={moderate.isPending}
      />

      <ConfirmDialog
        open={unflagging !== null}
        onClose={() => setUnflagging(null)}
        onConfirm={() => {
          if (unflagging)
            moderate.mutate(
              { id: unflagging._id, status: "published" },
              { onSuccess: () => setUnflagging(null) },
            );
        }}
        title="Restore this job?"
        description="It returns to the public board as published."
        confirmLabel="Restore"
        loading={moderate.isPending}
      />
    </div>
  );
}
