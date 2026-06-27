import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/utils";

const tones: Record<string, string> = {
  draft: "bg-surface-3 text-ink-subtle border-hairline-strong",
  published: "bg-tag-mint/10 text-tag-mint border-tag-mint/30",
  active: "bg-tag-mint/10 text-tag-mint border-tag-mint/30",
  closed: "bg-surface-3 text-ink-subtle border-hairline-strong",
  expired: "bg-surface-3 text-ink-tertiary border-hairline",
  suspended: "bg-error/10 text-error border-error/30",
  flagged: "bg-warning/10 text-warning border-warning/30",
  applied: "bg-tag-sky/10 text-tag-sky border-tag-sky/30",
  reviewed: "bg-tag-lavender/10 text-tag-lavender border-tag-lavender/30",
  interview: "bg-primary/15 text-primary-hover border-primary/40",
  offer: "bg-tag-mint/10 text-tag-mint border-tag-mint/30",
  rejected: "bg-error/10 text-error border-error/30",
  withdrawn: "bg-surface-3 text-ink-subtle border-hairline-strong",
  scheduled: "bg-tag-sky/10 text-tag-sky border-tag-sky/30",
  completed: "bg-tag-mint/10 text-tag-mint border-tag-mint/30",
  cancelled: "bg-error/10 text-error border-error/30",
  missed: "bg-warning/10 text-warning border-warning/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  resolved: "bg-tag-mint/10 text-tag-mint border-tag-mint/30",
  dismissed: "bg-surface-3 text-ink-subtle border-hairline-strong",
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = tones[status] ?? "bg-surface-3 text-ink-muted border-hairline";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5",
        tone,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {titleCase(status)}
    </span>
  );
}
