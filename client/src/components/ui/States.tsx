import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-hairline-strong bg-surface-1/40 px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full border border-hairline bg-surface-2 text-ink-subtle">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-[15px] font-medium text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-subtle">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-8 text-center">
      <p className="text-sm text-ink-muted">
        Something went wrong. The server may be waking up.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-primary-hover hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-hairline bg-surface-1"
        />
      ))}
    </div>
  );
}
