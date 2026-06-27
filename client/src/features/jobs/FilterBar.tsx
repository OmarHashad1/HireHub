"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  JOB_TYPE,
  EXPERIENCE_LEVEL,
  JOB_TYPE_LABEL,
  EXPERIENCE_LABEL,
  type JobType,
  type ExperienceLevel,
} from "@/lib/types";
import type { JobFilters } from "@/features/jobs/api";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
        active
          ? "border-hairline-strong bg-surface-2 text-ink"
          : "border-hairline text-ink-subtle hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: JobFilters;
  onChange: (next: JobFilters) => void;
}) {
  const hasFilters =
    !!filters.type ||
    !!filters.experienceLevel ||
    !!filters.isRemote ||
    !!filters.search;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
        <input
          value={filters.search ?? ""}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value || undefined })
          }
          placeholder="Search title, skill, or location"
          className="h-11 w-full rounded-md border border-hairline bg-surface-1 pl-10 pr-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-primary"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Pill
          active={!!filters.isRemote}
          onClick={() =>
            onChange({ ...filters, isRemote: !filters.isRemote || undefined })
          }
        >
          Remote
        </Pill>

        {JOB_TYPE.map((t) => (
          <Pill
            key={t}
            active={filters.type === t}
            onClick={() =>
              onChange({
                ...filters,
                type: filters.type === t ? undefined : (t as JobType),
              })
            }
          >
            {JOB_TYPE_LABEL[t]}
          </Pill>
        ))}

        {EXPERIENCE_LEVEL.map((lvl) => (
          <Pill
            key={lvl}
            active={filters.experienceLevel === lvl}
            onClick={() =>
              onChange({
                ...filters,
                experienceLevel:
                  filters.experienceLevel === lvl
                    ? undefined
                    : (lvl as ExperienceLevel),
              })
            }
          >
            {EXPERIENCE_LABEL[lvl]}
          </Pill>
        ))}

        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-ink-subtle hover:text-ink"
          >
            <X className="size-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
