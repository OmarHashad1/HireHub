"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  FileText,
  Mail,
  Sparkles,
  Users,
  ClipboardCheck,
} from "lucide-react";
import {
  useMyCompany,
  useMyJobs,
  useJobApplicants,
} from "@/features/recruiter/api";
import { usePresignedUrl } from "@/lib/presigned";
import { ScheduleInterviewModal } from "@/features/recruiter/ScheduleInterviewModal";
import { UpdateApplicationModal } from "@/features/recruiter/UpdateApplicationModal";
import {
  type JobApplicant,
  type ApplicationStatus,
  APPLICATION_STATUS_LABEL,
  applicantName,
} from "@/lib/types";
import { cn, relativeTime, initials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: "border-tag-sky/30 bg-tag-sky/10 text-tag-sky",
  reviewed: "border-tag-lavender/30 bg-tag-lavender/10 text-tag-lavender",
  interview: "border-primary/40 bg-primary/10 text-primary-hover",
  offer: "border-tag-mint/30 bg-tag-mint/10 text-tag-mint",
  rejected: "border-error/30 bg-error/10 text-error",
  withdrawn: "border-hairline bg-surface-3 text-ink-subtle",
};

function StatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status],
      )}
    >
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}

function ApplicantCard({
  application,
  onSchedule,
  onReview,
}: {
  application: JobApplicant;
  onSchedule: () => void;
  onReview: () => void;
}) {
  const { data: cvUrl } = usePresignedUrl(application.cv);
  const name = applicantName(application.applicant);
  const ref = application.applicant;
  const headline = typeof ref === "object" ? ref.headline : null;
  const email = typeof ref === "object" ? ref.email : null;

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface-3 text-[13px] font-semibold text-ink-subtle">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-ink">{name}</p>
            <StatusPill status={application.status} />
            {application.autoRejected && (
              <span className="inline-flex items-center gap-1 rounded-full border border-error/30 bg-error/10 px-2 py-0.5 text-[11px] text-error">
                Auto-rejected
              </span>
            )}
          </div>
          {headline && (
            <p className="truncate text-[13px] text-ink-subtle">{headline}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-tertiary">
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1 hover:text-ink"
              >
                <Mail className="size-3.5" />
                {email}
              </a>
            )}
            <span>Applied {relativeTime(application.createdAt)}</span>
          </div>
        </div>
      </div>

      {application.aiRating != null && (
        <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-primary-hover">
            <Sparkles className="size-3.5" />
            AI score: {application.aiRating}/100
          </p>
          {application.aiNotes && (
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              {application.aiNotes}
            </p>
          )}
        </div>
      )}

      {application.coverLetter && (
        <p className="mt-3 line-clamp-4 whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">
          {application.coverLetter}
        </p>
      )}

      {application.recruiterNotes && (
        <p className="mt-3 rounded-md border border-hairline bg-surface-2/40 p-3 text-[12px] text-ink-muted">
          <span className="font-medium text-ink-subtle">Notes: </span>
          {application.recruiterNotes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
        {cvUrl && (
          <a href={cvUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm">
              <FileText className="size-3.5" />
              View CV
            </Button>
          </a>
        )}
        {application.status === "applied" && (
          <Button variant="secondary" size="sm" onClick={onSchedule}>
            <CalendarPlus className="size-3.5" />
            Schedule interview
          </Button>
        )}
        <Button size="sm" onClick={onReview}>
          <ClipboardCheck className="size-3.5" />
          Review
        </Button>
      </div>
    </div>
  );
}

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = String(params.id);

  const company = useMyCompany();
  const jobsQuery = useMyJobs(company.data?._id);
  const applicantsQuery = useJobApplicants(jobId);

  const [scheduleFor, setScheduleFor] = useState<JobApplicant | null>(null);
  const [reviewFor, setReviewFor] = useState<JobApplicant | null>(null);

  const job = jobsQuery.data?.docs.find((j) => j._id === jobId);
  const applicants = applicantsQuery.data?.docs ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/recruiter/jobs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-subtle transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <PageHeader
        title={job?.title ?? "Applicants"}
        subtitle={
          job ? `${job.applicantsCount} total applicants` : "Review applicants"
        }
      />

      {applicantsQuery.isLoading && <CardSkeleton count={3} />}
      {applicantsQuery.isError && (
        <ErrorState onRetry={() => applicantsQuery.refetch()} />
      )}

      {!applicantsQuery.isLoading &&
        !applicantsQuery.isError &&
        (applicants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="Applications will appear here as candidates apply."
          />
        ) : (
          <div className="space-y-3">
            {applicants.map((application) => (
              <ApplicantCard
                key={application._id}
                application={application}
                onSchedule={() => setScheduleFor(application)}
                onReview={() => setReviewFor(application)}
              />
            ))}
          </div>
        ))}

      {scheduleFor && (
        <ScheduleInterviewModal
          open={scheduleFor !== null}
          onClose={() => setScheduleFor(null)}
          applicationId={scheduleFor._id}
          jobId={jobId}
          applicantName={applicantName(scheduleFor.applicant)}
        />
      )}

      {reviewFor && (
        <UpdateApplicationModal
          key={reviewFor._id}
          onClose={() => setReviewFor(null)}
          application={reviewFor}
          jobId={jobId}
        />
      )}
    </div>
  );
}
