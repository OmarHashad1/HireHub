"use client";

import {
  Mail,
  Phone,
  CalendarDays,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminUser, type AdminUser } from "@/features/admin/api";
import { initials, relativeTime, titleCase } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { StatusPill } from "@/components/StatusPill";
import { SkillTag } from "@/components/SkillTag";
import { CardSkeleton } from "@/components/ui/States";

function fmt(date?: string | null) {
  if (!date) return "";
  try {
    return format(new Date(date), "MMM yyyy");
  } catch {
    return "";
  }
}

function Row({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-muted">
      <Icon className="size-3.5 shrink-0 text-ink-subtle" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-eyebrow text-ink-tertiary">
        <Icon className="size-3.5" />
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// Mounted on demand (the entrance animation plays on mount).
export function UserDetailDrawer({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const { data, isLoading } = useAdminUser(user._id);
  const socials = data?.socialMedia
    ? Object.entries(data.socialMedia).filter(([, url]) => !!url)
    : [];

  return (
    <Drawer open onClose={onClose} title="User details">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-hairline bg-surface-3 text-sm font-semibold text-ink-subtle">
            {initials(`${user.firstName} ${user.lastName}`)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                {user.firstName} {user.lastName}
              </h2>
              <StatusPill status={user.status} />
            </div>
            <p className="text-[13px] text-ink-subtle">
              {titleCase(user.role)}
              {data?.headline ? ` · ${data.headline}` : ""}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-hairline bg-surface-2/30 p-4">
          <Row icon={Mail}>{user.email}</Row>
          {data?.phoneNumber && <Row icon={Phone}>{data.phoneNumber}</Row>}
          <Row icon={CalendarDays}>Joined {relativeTime(user.createdAt)}</Row>
          {data && (
            <Row icon={BadgeCheck}>
              {data.isEmailVerified ? "Email verified" : "Email not verified"}
              {data.provider ? ` · ${titleCase(data.provider)}` : ""}
            </Row>
          )}
        </div>

        {user.status === "banned" && user.banReason && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-[13px] text-error">
            <span className="font-medium">Ban reason: </span>
            {user.banReason}
          </div>
        )}

        {isLoading && <CardSkeleton count={2} />}

        {data?.bio && (
          <p className="text-[13px] leading-relaxed text-ink-muted">{data.bio}</p>
        )}

        {data?.skills && data.skills.length > 0 && (
          <Section icon={BadgeCheck} title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s) => (
                <SkillTag key={s} label={s} />
              ))}
            </div>
          </Section>
        )}

        {data?.experience && data.experience.length > 0 && (
          <Section icon={Briefcase} title="Experience">
            <ul className="space-y-3">
              {data.experience.map((exp) => (
                <li
                  key={exp._id}
                  className="rounded-lg border border-hairline bg-surface-2/30 p-3"
                >
                  <p className="text-sm font-medium text-ink">{exp.title}</p>
                  <p className="text-[13px] text-ink-subtle">{exp.company}</p>
                  <p className="mt-1 text-[12px] text-ink-tertiary">
                    {fmt(exp.startDate)} –{" "}
                    {exp.current ? "Present" : fmt(exp.endDate) || "—"}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data?.education && data.education.length > 0 && (
          <Section icon={GraduationCap} title="Education">
            <ul className="space-y-3">
              {data.education.map((edu) => (
                <li
                  key={edu._id}
                  className="rounded-lg border border-hairline bg-surface-2/30 p-3"
                >
                  <p className="text-sm font-medium text-ink">{edu.field}</p>
                  <p className="text-[13px] text-ink-subtle">{edu.institution}</p>
                  <p className="mt-1 text-[12px] text-ink-tertiary">
                    {fmt(edu.from)} – {fmt(edu.to)}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socials.map(([key, url]) => (
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
    </Drawer>
  );
}
