"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Plus,
  Users,
  Pencil,
  Send,
  Lock,
  EyeOff,
  Trash2,
  ChevronRight,
} from "lucide-react";
import {
  useMyCompany,
  useMyJobs,
  usePublishJob,
  useCloseJob,
  useDraftJob,
  useDeleteJob,
} from "@/features/recruiter/api";
import { JobFormModal } from "@/features/recruiter/JobFormModal";
import {
  type Job,
  type JobStatus,
  JOB_STATUS_LABEL,
  JOB_TYPE_LABEL,
} from "@/lib/types";
import { cn, relativeTime, formatSalary } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

const STATUS_STYLES: Record<JobStatus, string> = {
  published: "border-tag-mint/30 bg-tag-mint/10 text-tag-mint",
  draft: "border-hairline bg-surface-3 text-ink-subtle",
  closed: "border-hairline bg-surface-3 text-ink-muted",
  expired: "border-tag-peach/30 bg-tag-peach/10 text-tag-peach",
  suspended: "border-error/30 bg-error/10 text-error",
  flagged: "border-error/30 bg-error/10 text-error",
};

function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status],
      )}
    >
      {JOB_STATUS_LABEL[status]}
    </span>
  );
}

function JobRow({
  job,
  onEdit,
  onPublish,
  onClose,
  onDraft,
  onDelete,
  busy,
}: {
  job: Job;
  onEdit: () => void;
  onPublish: () => void;
  onClose: () => void;
  onDraft: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const place = job.location.isRemote
    ? "Remote"
    : [job.location.city, job.location.country].filter(Boolean).join(", ") ||
      "On-site";
  const salary = formatSalary(job.salary);

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4 transition-colors hover:border-hairline-strong sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/recruiter/jobs/${job._id}`}
              className="truncate text-[15px] font-semibold tracking-tight text-ink hover:underline"
            >
              {job.title}
            </Link>
            <StatusPill status={job.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-subtle">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {place}
            </span>
            <span>{JOB_TYPE_LABEL[job.type]}</span>
            {salary && <span>{salary}</span>}
            <span className="text-ink-tertiary">
              Posted {relativeTime(job.createdAt)}
            </span>
          </div>
        </div>
        <Link
          href={`/recruiter/jobs/${job._id}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          <Users className="size-3.5" />
          {job.applicantsCount}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
        <Button variant="secondary" size="sm" onClick={onEdit} disabled={busy}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        {job.status === "draft" && (
          <Button size="sm" onClick={onPublish} disabled={busy}>
            <Send className="size-3.5" />
            Publish
          </Button>
        )}
        {job.status === "published" && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDraft}
              disabled={busy}
            >
              <EyeOff className="size-3.5" />
              Move to draft
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={busy}
            >
              <Lock className="size-3.5" />
              Close
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onDelete}
          disabled={busy}
          className="ml-auto text-error hover:text-error"
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function RecruiterJobsPage() {
  const company = useMyCompany();
  const [page, setPage] = useState(1);
  const jobsQuery = useMyJobs(company.data?._id, page);
  const publish = usePublishJob();
  const close = useCloseJob();
  const draft = useDraftJob();
  const remove = useDeleteJob();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [closing, setClosing] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (job: Job) => {
    setEditing(job);
    setFormOpen(true);
  };

  const jobs = jobsQuery.data?.docs ?? [];
  const busy =
    publish.isPending ||
    close.isPending ||
    draft.isPending ||
    remove.isPending;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Jobs"
        subtitle="Create, publish, and manage your roles."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Post job
          </Button>
        }
      />

      {(company.isLoading || jobsQuery.isLoading) && <CardSkeleton count={3} />}

      {company.isError && <ErrorState onRetry={() => company.refetch()} />}
      {!company.isError && jobsQuery.isError && (
        <ErrorState onRetry={() => jobsQuery.refetch()} />
      )}

      {!company.isLoading &&
        !jobsQuery.isLoading &&
        !company.isError &&
        !jobsQuery.isError &&
        (jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Post your first role to start receiving applications."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Post job
              </Button>
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobRow
                  key={job._id}
                  job={job}
                  busy={busy}
                  onEdit={() => openEdit(job)}
                  onPublish={() => publish.mutate(job._id)}
                  onClose={() => setClosing(job)}
                  onDraft={() => draft.mutate(job._id)}
                  onDelete={() => setDeleting(job)}
                />
              ))}
            </div>
            <Pagination
              page={page}
              pages={jobsQuery.data?.meta.pages ?? 1}
              onPage={setPage}
            />
          </>
        ))}

      <JobFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        job={editing ?? undefined}
      />

      <ConfirmDialog
        open={closing !== null}
        onClose={() => setClosing(null)}
        onConfirm={() => {
          if (closing) close.mutate(closing._id);
          setClosing(null);
        }}
        title="Close this job?"
        description="It will be removed from the public board and stop accepting applications."
        confirmLabel="Close job"
        loading={close.isPending}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting._id);
          setDeleting(null);
        }}
        title="Delete this job?"
        description="This permanently removes the job and can't be undone."
        confirmLabel="Delete job"
        destructive
        loading={remove.isPending}
      />
    </div>
  );
}
