"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Video,
  MapPin,
} from "lucide-react";
import {
  useMyCompany,
  useCompanyInterviews,
  useUpdateInterview,
} from "@/features/recruiter/api";
import { RescheduleInterviewModal } from "@/features/recruiter/RescheduleInterviewModal";
import {
  type Interview,
  type InterviewStatus,
  INTERVIEW_STATUS_LABEL,
  INTERVIEW_TYPE_LABEL,
  applicantName,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";

const STATUS_STYLES: Record<InterviewStatus, string> = {
  scheduled: "border-primary/40 bg-primary/10 text-primary-hover",
  completed: "border-tag-mint/30 bg-tag-mint/10 text-tag-mint",
  cancelled: "border-error/30 bg-error/10 text-error",
  missed: "border-tag-peach/30 bg-tag-peach/10 text-tag-peach",
};

function jobTitle(interview: Interview) {
  return typeof interview.job === "object" ? interview.job.title : undefined;
}

function InterviewCard({
  interview,
  onReschedule,
  onCancel,
  onComplete,
  busy,
}: {
  interview: Interview;
  onReschedule: () => void;
  onCancel: () => void;
  onComplete: () => void;
  busy: boolean;
}) {
  const when = new Date(interview.scheduledAt);
  const isScheduled = interview.status === "scheduled";

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-ink">
              {applicantName(interview.applicant)}
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                STATUS_STYLES[interview.status],
              )}
            >
              {INTERVIEW_STATUS_LABEL[interview.status]}
            </span>
          </div>
          {jobTitle(interview) && (
            <p className="text-[13px] text-ink-subtle">{jobTitle(interview)}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5 text-ink-subtle" />
              {format(when, "EEE, MMM d · h:mm a")}
            </span>
            <span className="inline-flex items-center gap-1">
              {interview.type === "online" ? (
                <Video className="size-3.5 text-ink-subtle" />
              ) : (
                <MapPin className="size-3.5 text-ink-subtle" />
              )}
              {INTERVIEW_TYPE_LABEL[interview.type]}
            </span>
          </div>
          {interview.cancellationReason && (
            <p className="mt-2 text-[12px] text-ink-tertiary">
              Reason: {interview.cancellationReason}
            </p>
          )}
        </div>
      </div>

      {isScheduled && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onReschedule}
            disabled={busy}
          >
            <CalendarClock className="size-3.5" />
            Reschedule
          </Button>
          <Button size="sm" onClick={onComplete} disabled={busy}>
            <CheckCircle2 className="size-3.5" />
            Mark completed
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={busy}
          >
            <CalendarX className="size-3.5" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function CancelInterviewModal({
  onClose,
  interview,
}: {
  onClose: () => void;
  interview: Interview;
}) {
  const update = useUpdateInterview();
  const [reason, setReason] = useState("");

  const submit = () => {
    update.mutate(
      {
        id: interview._id,
        payload: { status: "cancelled", cancellationReason: reason.trim() },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Cancel interview"
      description="The candidate will be notified."
    >
      <div className="space-y-4">
        <TextArea
          label="Cancellation reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Let the candidate know why."
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Keep interview
          </Button>
          <Button
            onClick={submit}
            disabled={update.isPending || reason.trim().length === 0}
            className="bg-error hover:bg-error/90"
          >
            {update.isPending ? "Cancelling…" : "Cancel interview"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function RecruiterInterviewsPage() {
  const company = useMyCompany();
  const [page, setPage] = useState(1);
  const interviewsQuery = useCompanyInterviews(company.data?._id, page);
  const update = useUpdateInterview();

  const [rescheduleFor, setRescheduleFor] = useState<Interview | null>(null);
  const [cancelFor, setCancelFor] = useState<Interview | null>(null);
  const [completeFor, setCompleteFor] = useState<Interview | null>(null);

  const interviews = interviewsQuery.data?.docs ?? [];
  const loading = company.isLoading || interviewsQuery.isLoading;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Interviews"
        subtitle="Manage your scheduled interviews."
      />

      {loading && <CardSkeleton count={3} />}
      {(company.isError || interviewsQuery.isError) && (
        <ErrorState onRetry={() => interviewsQuery.refetch()} />
      )}

      {!loading &&
        !company.isError &&
        !interviewsQuery.isError &&
        (interviews.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No interviews scheduled"
            description="Schedule interviews from a job's applicants list."
          />
        ) : (
          <>
            <div className="space-y-3">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  busy={update.isPending}
                  onReschedule={() => setRescheduleFor(interview)}
                  onCancel={() => setCancelFor(interview)}
                  onComplete={() => setCompleteFor(interview)}
                />
              ))}
            </div>
            <Pagination
              page={page}
              pages={interviewsQuery.data?.meta.pages ?? 1}
              onPage={setPage}
            />
          </>
        ))}

      <RescheduleInterviewModal
        open={rescheduleFor !== null}
        onClose={() => setRescheduleFor(null)}
        interview={rescheduleFor}
      />

      {cancelFor && (
        <CancelInterviewModal
          key={cancelFor._id}
          onClose={() => setCancelFor(null)}
          interview={cancelFor}
        />
      )}

      <ConfirmDialog
        open={completeFor !== null}
        onClose={() => setCompleteFor(null)}
        onConfirm={() => {
          if (completeFor)
            update.mutate(
              { id: completeFor._id, payload: { status: "completed" } },
              { onSuccess: () => setCompleteFor(null) },
            );
        }}
        title="Mark interview as completed?"
        description="This records the interview as done."
        confirmLabel="Mark completed"
        loading={update.isPending}
      />
    </div>
  );
}
