"use client";

import { Briefcase, GraduationCap, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { SkillTag } from "@/components/SkillTag";
import { CardSkeleton, ErrorState } from "@/components/ui/States";
import { useFullProfile } from "@/features/user/api";
import { EDUCATION_LABEL } from "@/schemas/enums";

function fmt(date?: string | null) {
  if (!date) return "";
  try {
    return format(new Date(date), "MMM yyyy");
  } catch {
    return "";
  }
}

// Mounted only while viewing a candidate, so the query runs on demand.
export function CandidateProfileModal({
  applicantId,
  fallbackName,
  onClose,
}: {
  applicantId: string;
  fallbackName: string;
  onClose: () => void;
}) {
  const { data: profile, isLoading, isError, refetch } =
    useFullProfile(applicantId);

  const links = profile?.socialMedia
    ? Object.entries(profile.socialMedia).filter(([, url]) => !!url)
    : [];

  return (
    <Modal open onClose={onClose} title={fallbackName} size="lg">
      {isLoading && <CardSkeleton count={2} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {profile && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {profile.firstName} {profile.lastName}
            </h3>
            {profile.headline && (
              <p className="text-sm text-ink-subtle">{profile.headline}</p>
            )}
            {profile.bio && (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {profile.bio}
              </p>
            )}
            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map(([key, url]) => (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[12px] text-ink-muted capitalize hover:text-ink"
                  >
                    {key}
                    <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {profile.skills?.length > 0 && (
            <div>
              <h4 className="text-eyebrow text-ink-tertiary">Skills</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <SkillTag key={s} label={s} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="flex items-center gap-2 text-eyebrow text-ink-tertiary">
              <Briefcase className="size-3.5" />
              Experience
            </h4>
            {profile.experience?.length ? (
              <ul className="mt-2 space-y-3">
                {profile.experience.map((exp) => (
                  <li
                    key={exp._id}
                    className="rounded-lg border border-hairline bg-surface-2/30 p-3"
                  >
                    <p className="text-sm font-medium text-ink">{exp.title}</p>
                    <p className="text-[13px] text-ink-subtle">{exp.company}</p>
                    <p className="mt-1 text-[12px] text-ink-tertiary">
                      {fmt(exp.startDate)} –{" "}
                      {exp.current
                        ? "Present"
                        : exp.endDate
                          ? fmt(exp.endDate)
                          : "—"}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                        {exp.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-subtle">
                No experience listed.
              </p>
            )}
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-eyebrow text-ink-tertiary">
              <GraduationCap className="size-3.5" />
              Education
            </h4>
            {profile.education?.length ? (
              <ul className="mt-2 space-y-3">
                {profile.education.map((edu) => (
                  <li
                    key={edu._id}
                    className="rounded-lg border border-hairline bg-surface-2/30 p-3"
                  >
                    <p className="text-sm font-medium text-ink">
                      {edu.field} ·{" "}
                      {EDUCATION_LABEL[
                        edu.level as keyof typeof EDUCATION_LABEL
                      ] ?? edu.level}
                    </p>
                    <p className="text-[13px] text-ink-subtle">
                      {edu.institution}
                    </p>
                    <p className="mt-1 text-[12px] text-ink-tertiary">
                      {fmt(edu.from)} – {fmt(edu.to)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-subtle">No education listed.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
