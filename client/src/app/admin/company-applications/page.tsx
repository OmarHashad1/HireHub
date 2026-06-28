"use client";

import { useState } from "react";
import {
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Check,
  X,
} from "lucide-react";
import {
  useCompanyApplications,
  useReviewCompanyApplication,
  type CompanyApplication,
} from "@/features/admin/api";
import { usePresignedUrl } from "@/lib/presigned";
import { relativeTime } from "@/lib/utils";
import { INDUSTRY_LABEL } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { ReasonDialog } from "@/components/ui/ReasonDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";

function DocLink({ label, docKey }: { label: string; docKey?: string }) {
  const { data: url } = usePresignedUrl(docKey);
  if (!docKey) return null;
  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      aria-disabled={!url}
      className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[12px] text-ink-muted hover:text-ink"
    >
      <FileText className="size-3.5" />
      {label}
    </a>
  );
}

function ApplicationCard({
  app,
  onApprove,
  onReject,
  busy,
}: {
  app: CompanyApplication;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  const place = [app.location?.city, app.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-ink">
              {app.companyName}
            </h3>
            <StatusPill status={app.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-subtle">
            <span className="inline-flex items-center gap-1">
              <Mail className="size-3.5" />
              {app.companyEmail}
            </span>
            {app.contactPhone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" />
                {app.contactPhone}
              </span>
            )}
            {place && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {place}
              </span>
            )}
            <span>
              {INDUSTRY_LABEL[app.industry] ?? app.industry} · {app.size}
            </span>
            <span className="text-ink-tertiary">
              {relativeTime(app.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
        {app.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <DocLink
          label="Commercial registration"
          docKey={app.documents?.commercialRegistration}
        />
        <DocLink label="Tax card" docKey={app.documents?.taxCard} />
      </div>

      {app.rejectionReason && (
        <p className="mt-3 rounded-md border border-hairline bg-surface-2/40 p-3 text-[12px] text-ink-muted">
          <span className="font-medium text-ink-subtle">Rejected: </span>
          {app.rejectionReason}
        </p>
      )}

      {app.status === "pending" && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
          <Button size="sm" onClick={onApprove} disabled={busy}>
            <Check className="size-3.5" />
            Approve
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReject}
            disabled={busy}
            className="text-error hover:text-error"
          >
            <X className="size-3.5" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminOnboardingPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useCompanyApplications(page);
  const review = useReviewCompanyApplication();

  const [approving, setApproving] = useState<CompanyApplication | null>(null);
  const [rejecting, setRejecting] = useState<CompanyApplication | null>(null);

  const apps = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Onboarding"
        subtitle="Review company verification requests."
      />

      {isLoading && <CardSkeleton count={3} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && apps.length === 0 && (
        <EmptyState
          icon={FileCheck2}
          title="No applications"
          description="New company verification requests will appear here."
        />
      )}

      {apps.length > 0 && (
        <>
          <div className="space-y-3">
            {apps.map((app) => (
              <ApplicationCard
                key={app._id}
                app={app}
                busy={review.isPending}
                onApprove={() => setApproving(app)}
                onReject={() => setRejecting(app)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pages={data?.meta.pages ?? 1}
            onPage={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={approving !== null}
        onClose={() => setApproving(null)}
        onConfirm={() => {
          if (approving)
            review.mutate(
              { applicationID: approving._id, status: "approved" },
              { onSuccess: () => setApproving(null) },
            );
        }}
        title={`Approve ${approving?.companyName ?? "this company"}?`}
        description="A company account is created and credentials are emailed."
        confirmLabel="Approve"
        loading={review.isPending}
      />

      {rejecting && (
        <ReasonDialog
          title={`Reject ${rejecting.companyName}?`}
          description="The applicant is notified with your reason."
          label="Rejection reason"
          required
          placeholder="At least 5 characters."
          confirmLabel="Reject"
          destructive
          loading={review.isPending}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) =>
            review.mutate(
              {
                applicationID: rejecting._id,
                status: "rejected",
                rejectionReason: reason,
              },
              { onSuccess: () => setRejecting(null) },
            )
          }
        />
      )}
    </div>
  );
}
