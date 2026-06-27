"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Building2,
  CalendarClock,
  CheckCircle2,
  Flag,
  MapPin,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth";
import { ApplyModal } from "@/features/applications/ApplyModal";
import { ReportCompanyModal } from "@/features/reports/ReportCompanyModal";
import {
  type Job,
  JOB_TYPE_LABEL,
  EXPERIENCE_LABEL,
  companyName,
  companyId,
  companyLogo,
} from "@/lib/types";
import { relativeTime, formatSalary, countdown, pluralize } from "@/lib/utils";
import { SkillTag } from "@/components/SkillTag";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Button } from "@/components/ui/Button";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-eyebrow text-ink-tertiary">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function JobDetail({
  job,
  saved,
  onToggleSave,
  applied: appliedProp,
  onClose,
}: {
  job: Job;
  saved?: boolean;
  onToggleSave?: () => void;
  applied?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const { data: user } = useSession();
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const applied = appliedProp || justApplied;

  const onReport = () => {
    if (!user) {
      router.push("/login?from=/jobs");
      return;
    }
    if (user.role !== "user") {
      toast.info("Only job seekers can report a company");
      return;
    }
    setReportOpen(true);
  };

  const name = companyName(job.company);
  const place = job.location.isRemote
    ? "Remote"
    : [job.location.city, job.location.country].filter(Boolean).join(", ") ||
      "On-site";
  const salary = formatSalary(job.salary);
  const deadline = countdown(job.deadline);

  const onApply = () => {
    if (!user) {
      router.push("/login?from=/jobs");
      return;
    }
    if (user.role !== "user") {
      toast.info("Only job seekers can apply to roles");
      return;
    }
    setApplyOpen(true);
  };

  return (
    <motion.div
      key={job._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col"
    >
      <div className="flex items-start gap-4 border-b border-hairline p-5 sm:p-6">
        <CompanyLogo
          logoKey={companyLogo(job.company)}
          name={name}
          seed={companyId(job.company)}
          size={48}
          className="rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            {job.title}
          </h2>
          <Link
            href={`/companies/${companyId(job.company)}`}
            className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-ink-subtle transition-colors hover:text-ink"
          >
            <Building2 className="size-3.5" />
            {name ?? "Company on HireHub"}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-ink-subtle" />
              {place}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-ink-subtle" />
              {pluralize(job.applicantsCount, "applicant")}
            </span>
            <span className="text-ink-tertiary">
              Posted {relativeTime(job.createdAt)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-md text-ink-subtle hover:bg-surface-3 hover:text-ink lg:hidden"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-[12px] text-ink-muted">
            {JOB_TYPE_LABEL[job.type]}
          </span>
          <span className="rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-[12px] text-ink-muted">
            {EXPERIENCE_LABEL[job.experienceLevel]}
          </span>
          {salary && (
            <span className="rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-[12px] text-ink-muted">
              {salary}
            </span>
          )}
          {deadline && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-[12px] text-ink-muted">
              <CalendarClock className="size-3.5" />
              {deadline}
            </span>
          )}
          {job.aiThreshold != null && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[12px] text-primary-hover">
              <Sparkles className="size-3.5" />
              AI-screened
            </span>
          )}
        </div>

        <div className="mt-7 space-y-7">
          <Section title="About the role">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
              {job.description}
            </p>
          </Section>

          {job.requirements.length > 0 && (
            <Section title="Requirements">
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[15px] text-ink-muted"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-hover" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {job.skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <SkillTag key={s} label={s} />
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-hairline bg-surface-1/80 p-4 backdrop-blur">
        {applied ? (
          <Button variant="secondary" className="flex-1" disabled>
            <CheckCircle2 className="size-4 text-tag-mint" />
            Applied
          </Button>
        ) : (
          <Button className="flex-1" onClick={onApply}>
            Apply now
          </Button>
        )}
        <Button
          variant="secondary"
          aria-label={saved ? "Unsave" : "Save"}
          onClick={onToggleSave}
          className="px-3.5"
        >
          <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />
        </Button>
        <Button
          variant="secondary"
          aria-label="Report company"
          onClick={onReport}
          className="px-3.5"
        >
          <Flag className="size-4" />
        </Button>
      </div>

      <ApplyModal
        jobId={job._id}
        jobTitle={job.title}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onApplied={() => setJustApplied(true)}
      />

      <ReportCompanyModal
        companyId={companyId(job.company)}
        companyName={name ?? undefined}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </motion.div>
  );
}
