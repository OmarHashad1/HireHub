"use client";

import { useState } from "react";
import { Users, Ban, ShieldCheck } from "lucide-react";
import {
  useAdminUsers,
  useUpdateUserStatus,
  type AdminUser,
} from "@/features/admin/api";
import { initials, relativeTime, titleCase } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/StatusPill";
import { Pagination } from "@/components/ui/Pagination";
import { ReasonDialog } from "@/components/ui/ReasonDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/ui/States";
import { UserDetailDrawer } from "@/features/admin/UserDetailDrawer";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminUsers(page);
  const update = useUpdateUserStatus();

  const [banning, setBanning] = useState<AdminUser | null>(null);
  const [unbanning, setUnbanning] = useState<AdminUser | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const users = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Users" subtitle="Manage job seekers and recruiters." />

      {isLoading && <CardSkeleton count={4} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && users.length === 0 && (
        <EmptyState icon={Users} title="No users found" />
      )}

      {users.length > 0 && (
        <>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u._id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(u)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(u);
                  }
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline bg-surface-1 p-3 transition-colors hover:border-hairline-strong hover:bg-surface-2 sm:p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-hairline bg-surface-3 text-[13px] font-semibold text-ink-subtle">
                  {initials(`${u.firstName} ${u.lastName}`)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">
                      {u.firstName} {u.lastName}
                    </p>
                    <StatusPill status={u.status} />
                    <span className="text-[11px] text-ink-tertiary">
                      {titleCase(u.role)}
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-ink-subtle">
                    {u.email} · joined {relativeTime(u.createdAt)}
                  </p>
                </div>
                {u.status === "banned" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUnbanning(u);
                    }}
                    disabled={update.isPending}
                  >
                    <ShieldCheck className="size-3.5" />
                    Unban
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBanning(u);
                    }}
                    disabled={update.isPending}
                    className="text-error hover:text-error"
                  >
                    <Ban className="size-3.5" />
                    Ban
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

      {banning && (
        <ReasonDialog
          title={`Ban ${banning.firstName} ${banning.lastName}?`}
          description="They'll be signed out and blocked from the platform."
          label="Ban reason"
          required
          placeholder="Why is this account being banned?"
          confirmLabel="Ban user"
          destructive
          loading={update.isPending}
          onClose={() => setBanning(null)}
          onConfirm={(reason) =>
            update.mutate(
              { id: banning._id, status: "banned", banReason: reason },
              { onSuccess: () => setBanning(null) },
            )
          }
        />
      )}

      <ConfirmDialog
        open={unbanning !== null}
        onClose={() => setUnbanning(null)}
        onConfirm={() => {
          if (unbanning)
            update.mutate(
              { id: unbanning._id, status: "active" },
              { onSuccess: () => setUnbanning(null) },
            );
        }}
        title="Reactivate this user?"
        description="They'll regain access to the platform."
        confirmLabel="Unban"
        loading={update.isPending}
      />

      {selected && (
        <UserDetailDrawer
          key={selected._id}
          user={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
