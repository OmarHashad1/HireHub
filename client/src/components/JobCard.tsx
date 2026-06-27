"use client";

import { Bookmark, Check, MapPin, Sparkles, Users } from "lucide-react";
import { cn, relativeTime, formatSalary, pluralize } from "@/lib/utils";
import {
  type Job,
  JOB_TYPE_LABEL,
  EXPERIENCE_LABEL,
  companyName,
  companyId,
  companyLogo,
} from "@/lib/types";
import { SkillTag } from "@/components/SkillTag";
import { CompanyLogo } from "@/components/CompanyLogo";

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 text-[12px] text-ink-muted">
      {children}
    </span>
  );
}

export function JobCard({
  job,
  selected = false,
  onSelect,
  saved,
  onToggleSave,
  applied,
  className,
}: {
  job: Job;
  selected?: boolean;
  onSelect?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  applied?: boolean;
  className?: string;
}) {
  const name = companyName(job.company);
  const featured = !!job.aiThreshold;
  const place = job.location.isRemote
    ? "Remote"
    : [job.location.city, job.location.country].filter(Boolean).join(", ") ||
      "On-site";
  const salary = formatSalary(job.salary);

  return (
    <article
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative rounded-lg border bg-surface-1 p-4 transition-all duration-200 sm:p-5",
        onSelect && "cursor-pointer hover:border-hairline-strong hover:bg-surface-2",
        selected
          ? "border-primary/70 bg-surface-2 ring-1 ring-primary/40"
          : featured
            ? "border-primary/40"
            : "border-hairline",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <CompanyLogo
          logoKey={companyLogo(job.company)}
          name={name}
          seed={companyId(job.company)}
          size={44}
          className="rounded-md"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink">
                  {job.title}
                </h3>
                {applied && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-tag-mint/30 bg-tag-mint/10 px-2 py-0.5 text-[11px] font-medium text-tag-mint">
                    <Check className="size-3" />
                    Applied
                  </span>
                )}
              </div>
              <p className="truncate text-[13px] text-ink-subtle">
                {name ?? "Company on HireHub"}
              </p>
            </div>
            {onToggleSave && (
              <button
                type="button"
                aria-label={saved ? "Unsave job" : "Save job"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink",
                  saved && "text-primary-hover",
                )}
              >
                <Bookmark
                  className="size-4"
                  fill={saved ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <MetaChip>
              <MapPin className="size-3.5 text-ink-subtle" />
              {place}
            </MetaChip>
            <MetaChip>{JOB_TYPE_LABEL[job.type]}</MetaChip>
            <MetaChip>{EXPERIENCE_LABEL[job.experienceLevel]}</MetaChip>
            {salary && <MetaChip>{salary}</MetaChip>}
          </div>

          {job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((s) => (
                <SkillTag key={s} label={s} />
              ))}
              {job.skills.length > 4 && (
                <span className="text-[11px] text-ink-tertiary">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-3 text-[12px] text-ink-tertiary">
            <span>{relativeTime(job.createdAt)}</span>
            <span
              className="inline-flex items-center gap-1"
              title={pluralize(job.applicantsCount, "applicant")}
              aria-label={pluralize(job.applicantsCount, "applicant")}
            >
              <Users className="size-3.5" />
              {job.applicantsCount}
            </span>
            {featured && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary-hover">
                <Sparkles className="size-3" />
                AI-screened
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
