import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-7 place-items-center rounded-md bg-primary text-on-primary shadow-[0_6px_16px_-8px_rgba(86,69,212,0.9)]",
        className,
      )}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 2v12M13 2v12M3 8h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
