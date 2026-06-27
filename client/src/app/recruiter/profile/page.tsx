"use client";

import { useRef, useState } from "react";
import {
  Pencil,
  Camera,
  Trash2,
  Globe,
  MapPin,
  Users,
  Building2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMyCompany,
  useUploadCompanyLogo,
  useDeleteCompanyLogo,
} from "@/features/recruiter/api";
import { CompanyProfileModal } from "@/features/recruiter/CompanyProfileModal";
import { CompanyLogo } from "@/components/CompanyLogo";
import {
  INDUSTRY_LABEL,
  BENEFIT_LABEL,
  type CompanyProfile,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState, CardSkeleton } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function Detail({
  icon: Icon,
  children,
}: {
  icon: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[13px] text-ink-muted">
      <Icon className="size-3.5 text-ink-subtle" />
      {children}
    </span>
  );
}

function ProfileView({ company }: { company: CompanyProfile }) {
  const uploadLogo = useUploadCompanyLogo();
  const deleteLogo = useDeleteCompanyLogo();
  const logoInput = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [removeLogo, setRemoveLogo] = useState(false);

  const place = [company.location?.city, company.location?.country]
    .filter(Boolean)
    .join(", ");

  const onPickLogo = (file?: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Max logo size is 2MB");
    uploadLogo.mutate(file);
  };

  return (
    <>
      <section className="grain relative overflow-hidden rounded-xl border border-hairline bg-surface-1 p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "radial-gradient(60% 100% at 25% 0%, rgba(86,69,212,0.16), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <CompanyLogo
              logoKey={company.logo}
              name={company.name}
              seed={company._id}
              size={84}
            />
            <button
              onClick={() => logoInput.current?.click()}
              className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border border-hairline bg-surface-3 text-ink-subtle hover:text-ink"
              aria-label="Change logo"
            >
              <Camera className="size-3.5" />
            </button>
            <input
              ref={logoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => onPickLogo(e.target.files?.[0])}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {company.name}
            </h1>
            {company.description && (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {company.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Detail icon={Building2}>
                {INDUSTRY_LABEL[company.industry] ?? company.industry}
              </Detail>
              <Detail icon={Users}>{company.size} employees</Detail>
              {place && <Detail icon={MapPin}>{place}</Detail>}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[13px] text-ink-muted hover:text-ink"
                >
                  <Globe className="size-3.5 text-ink-subtle" />
                  Website
                  <ExternalLink className="size-3" />
                </a>
              )}
              {company.socialMedia?.linkedin && (
                <a
                  href={company.socialMedia.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[13px] text-ink-muted hover:text-ink"
                >
                  <ExternalLink className="size-3.5 text-ink-subtle" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {company.logo && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRemoveLogo(true)}
              >
                <Trash2 className="size-3.5" />
                Logo
              </Button>
            )}
            <Button size="sm" onClick={() => setEdit(true)}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </section>

      {company.benefits && company.benefits.length > 0 && (
        <section className="mt-5 rounded-xl border border-hairline bg-surface-1 p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-ink">Benefits</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {company.benefits.map((b) => (
              <span
                key={b}
                className="rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 text-[12px] text-ink-muted"
              >
                {BENEFIT_LABEL[b] ?? b}
              </span>
            ))}
          </div>
        </section>
      )}

      <CompanyProfileModal
        open={edit}
        onClose={() => setEdit(false)}
        company={company}
      />
      <ConfirmDialog
        open={removeLogo}
        onClose={() => setRemoveLogo(false)}
        onConfirm={() => {
          deleteLogo.mutate();
          setRemoveLogo(false);
        }}
        title="Remove logo?"
        description="Your company will show a placeholder until you upload a new one."
        confirmLabel="Remove logo"
        destructive
        loading={deleteLogo.isPending}
      />
    </>
  );
}

export default function CompanyProfilePage() {
  const company = useMyCompany();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Company"
        subtitle="How your company appears to candidates."
      />

      {company.isLoading && <CardSkeleton count={2} />}
      {company.isError && <ErrorState onRetry={() => company.refetch()} />}
      {company.data && <ProfileView company={company.data} />}
    </div>
  );
}
