"use client";

import {
  Mail,
  MapPin,
  CalendarDays,
  Globe,
  Building2,
  Users,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminCompany, type AdminCompany } from "@/features/admin/api";
import { relativeTime } from "@/lib/utils";
import { INDUSTRY_LABEL, BENEFIT_LABEL } from "@/lib/types";
import { Drawer } from "@/components/ui/Drawer";
import { CompanyLogo } from "@/components/CompanyLogo";
import { StatusPill } from "@/components/StatusPill";
import { CardSkeleton } from "@/components/ui/States";

function fmtFounded(date?: string | null) {
  if (!date) return "";
  try {
    return format(new Date(date), "yyyy");
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

// Mounted on demand (the entrance animation plays on mount).
export function CompanyDetailDrawer({
  company,
  onClose,
}: {
  company: AdminCompany;
  onClose: () => void;
}) {
  const { data, isLoading } = useAdminCompany(company._id);
  const place = [data?.location?.city, data?.location?.country]
    .filter(Boolean)
    .join(", ");
  const socials = data?.socialMedia
    ? Object.entries(data.socialMedia).filter(([, url]) => !!url)
    : [];

  return (
    <Drawer open onClose={onClose} title="Company details">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <CompanyLogo
            logoKey={company.logo}
            name={company.name}
            seed={company._id}
            size={56}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                {company.name}
              </h2>
              <StatusPill status={company.status} />
            </div>
            <p className="text-[13px] text-ink-subtle">
              {INDUSTRY_LABEL[company.industry] ?? company.industry}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-hairline bg-surface-2/30 p-4">
          <Row icon={Mail}>{data?.email ?? company.email ?? "—"}</Row>
          {place && <Row icon={MapPin}>{place}</Row>}
          <Row icon={Users}>{company.size} employees</Row>
          {data?.foundedAt && (
            <Row icon={CalendarDays}>Founded {fmtFounded(data.foundedAt)}</Row>
          )}
          <Row icon={Building2}>Joined {relativeTime(company.createdAt)}</Row>
          {data?.website && (
            <a
              href={data.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink"
            >
              <Globe className="size-3.5 shrink-0 text-ink-subtle" />
              <span className="min-w-0 truncate">{data.website}</span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          )}
        </div>

        {company.status === "suspended" && company.suspend_reason && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-[13px] text-error">
            <span className="font-medium">Suspend reason: </span>
            {company.suspend_reason}
          </div>
        )}

        {isLoading && <CardSkeleton count={2} />}

        {data?.description && (
          <p className="text-[13px] leading-relaxed text-ink-muted">
            {data.description}
          </p>
        )}

        {data?.benefits && data.benefits.length > 0 && (
          <div>
            <h3 className="text-eyebrow text-ink-tertiary">Benefits</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.benefits.map((b) => (
                <span
                  key={b}
                  className="rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[12px] text-ink-muted"
                >
                  {BENEFIT_LABEL[b] ?? b}
                </span>
              ))}
            </div>
          </div>
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
