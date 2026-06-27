import { cn } from "@/lib/utils";

function colorFor(value: number) {
  if (value >= 80) return "var(--semantic-success)";
  if (value >= 60) return "var(--primary-hover)";
  if (value >= 40) return "var(--semantic-warning)";
  return "var(--semantic-error)";
}

export function ScoreRing({
  value,
  size = 48,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const color = colorFor(clamped);
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`AI score ${clamped} of 100`}
    >
      <div
        className="size-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${clamped * 3.6}deg, var(--surface-3) 0deg)`,
        }}
      />
      <div className="absolute inset-[3px] grid place-items-center rounded-full bg-surface-1">
        <span
          className="font-mono font-medium tabular-nums"
          style={{ fontSize: size * 0.3, color }}
        >
          {clamped}
        </span>
      </div>
    </div>
  );
}
