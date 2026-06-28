"use client";

import { useState } from "react";
import { Building2, Ban, ShieldCheck } from "lucide-react";
import {
  useAdminCompanies,
  useUpdateCompanyStatus,
  type AdminCompany,
} from "@/features/admin/api";
import { relativeTime } from "@/lib/utils";
import { INDUSTRY_LABEL } from "@/lib/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { ReasonDialog } from "@/components/ui/ReasonDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";
import { CompanyDetailDrawer } from "@/features/admin/CompanyDetailDrawer";

export default function AdminCompaniesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminCompanies(page);
  const update = useUpdateCompanyStatus();

  const [suspending, setSuspending] = useState<AdminCompany | null>(null);
  const [restoring, setRestoring] = useState<AdminCompany | null>(null);
  const [selected, setSelected] = useState<AdminCompany | null>(null);

  const companies = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Companies" subtitle="Manage verified companies." />

      {isLoading && <CardSkeleton count={4} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && companies.length === 0 && (
        <EmptyState icon={Building2} title="No companies found" />
      )}

      {companies.length > 0 && (
        <>
          <div className="space-y-2">
            {companies.map((c) => (
              <div
                key={c._id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(c);
                  }
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline bg-surface-1 p-3 transition-colors hover:border-hairline-strong hover:bg-surface-2 sm:p-4"
              >
                <CompanyLogo
                  logoKey={c.logo}
                  name={c.name}
                  seed={c._id}
                  size={40}
                  className="rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">
                      {c.name}
                    </p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="truncate text-[12px] text-ink-subtle">
                    {INDUSTRY_LABEL[c.industry] ?? c.industry} · {c.size} ·
                    joined {relativeTime(c.createdAt)}
                  </p>
                </div>
                {c.status === "suspended" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRestoring(c);
                    }}
                    disabled={update.isPending}
                  >
                    <ShieldCheck className="size-3.5" />
                    Restore
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSuspending(c);
                    }}
                    disabled={update.isPending}
                    className="text-error hover:text-error"
                  >
                    <Ban className="size-3.5" />
                    Suspend
                  </Button>
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

      {suspending && (
        <ReasonDialog
          title={`Suspend ${suspending.name}?`}
          description="Their jobs stay hidden and they can't post until restored."
          label="Suspend reason"
          required
          placeholder="Why is this company being suspended?"
          confirmLabel="Suspend"
          destructive
          loading={update.isPending}
          onClose={() => setSuspending(null)}
          onConfirm={(reason) =>
            update.mutate(
              { id: suspending._id, status: "suspended", suspendReason: reason },
              { onSuccess: () => setSuspending(null) },
            )
          }
        />
      )}

      <ConfirmDialog
        open={restoring !== null}
        onClose={() => setRestoring(null)}
        onConfirm={() => {
          if (restoring)
            update.mutate(
              { id: restoring._id, status: "active" },
              { onSuccess: () => setRestoring(null) },
            );
        }}
        title="Restore this company?"
        description="They'll be able to post and manage jobs again."
        confirmLabel="Restore"
        loading={update.isPending}
      />

      {selected && (
        <CompanyDetailDrawer
          key={selected._id}
          company={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
