"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Building2, CheckCircle2, FileText } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { useSession } from "@/lib/auth";
import {
  companyApplicationSchema,
  type CompanyApplicationValues,
} from "@/schemas/company";
import { INDUSTRY, COMPANY_SIZE } from "@/schemas/enums";
import { DOC_MIME } from "@/schemas/_shared";
import { useApplyAsCompany } from "@/features/company/api";
import { titleCase } from "@/lib/utils";
import { TextField, TextArea, SelectField } from "@/components/ui/Field";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Button, ButtonLink } from "@/components/ui/Button";

const COMPANY_DOC_MIME = [...DOC_MIME, "image/jpeg", "image/png"] as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </>
  );
}

function DocField({
  label,
  file,
  onPick,
  onClear,
}: {
  label: string;
  file: File | null;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface-2/40 p-3">
          <span className="flex min-w-0 items-center gap-2">
            <FileText className="size-4 shrink-0 text-ink-subtle" />
            <span className="truncate text-sm text-ink-muted">{file.name}</span>
          </span>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[13px] text-ink-subtle hover:text-ink"
          >
            Change
          </button>
        </div>
      ) : (
        <FileDropzone
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          maxMB={10}
          mimes={COMPANY_DOC_MIME}
          onFile={onPick}
          label="Drop the document or click to browse"
        />
      )}
    </div>
  );
}

export default function CompanyApplyPage() {
  const { data: user, isLoading } = useSession();
  const apply = useApplyAsCompany();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [commercialRegistration, setCommercialRegistration] =
    useState<File | null>(null);
  const [taxCard, setTaxCard] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({ resolver: zodResolver(companyApplicationSchema) });

  if (isLoading) {
    return (
      <Shell>
        <div className="h-64 animate-pulse rounded-xl border border-hairline bg-surface-1" />
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="rounded-xl border border-hairline bg-surface-1 p-8 text-center">
          <Building2 className="mx-auto size-7 text-ink-subtle" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Hire on HireHub
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-subtle">
            Sign in with your seeker account to submit a company application.
            Once approved, you&apos;ll manage everything from the recruiter
            dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <ButtonLink href="/login?from=/company/apply">Sign in</ButtonLink>
            <ButtonLink href="/signup" variant="secondary">
              Create account
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  if (user.role !== "user") {
    return (
      <Shell>
        <div className="rounded-xl border border-hairline bg-surface-1 p-8 text-center">
          <Building2 className="mx-auto size-7 text-ink-subtle" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Already on board
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-subtle">
            Company applications are only available to job-seeker accounts.
          </p>
        </div>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        <div className="rounded-xl border border-hairline bg-surface-1 p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full border border-tag-mint/30 bg-tag-mint/10 text-tag-mint">
            <CheckCircle2 className="size-6" />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">
            Application submitted
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-subtle">
            Your company application is now pending admin review. We&apos;ll
            email you once it&apos;s approved — your account will then unlock the
            recruiter dashboard.
          </p>
          <div className="mt-6">
            <ButtonLink href="/me" variant="secondary">
              Back to workspace
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  const goToDocs = async () => {
    const ok = await trigger();
    if (ok) setStep(2);
    else toast.error("Fix the highlighted fields first");
  };

  const onSubmit = (values: CompanyApplicationValues) => {
    if (!commercialRegistration || !taxCard) {
      toast.error("Both documents are required");
      return;
    }
    apply.mutate(
      { values, files: { commercialRegistration, taxCard } },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  return (
    <Shell>
      <div className="mb-6">
        <p className="text-eyebrow text-primary-hover">Become a company</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">
          Apply to hire on HireHub
        </h1>
        <p className="mt-1 text-sm text-ink-subtle">
          Step {step} of 2 · {step === 1 ? "Company details" : "Verification documents"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={step === 1 ? "space-y-4" : "hidden"}>
          <TextField
            label="Company name"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Company email"
              type="email"
              error={errors.companyEmail?.message}
              {...register("companyEmail")}
            />
            <TextField
              label="Contact phone"
              placeholder="+201234567890"
              error={errors.contactPhone?.message}
              {...register("contactPhone")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Industry"
              defaultValue=""
              error={errors.industry?.message}
              {...register("industry")}
            >
              <option value="" disabled>
                Select industry
              </option>
              {INDUSTRY.map((i) => (
                <option key={i} value={i}>
                  {titleCase(i)}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Company size"
              defaultValue=""
              error={errors.size?.message}
              {...register("size")}
            >
              <option value="" disabled>
                Select size
              </option>
              {COMPANY_SIZE.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </SelectField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Country"
              hint="Max 10 characters"
              error={errors.location?.country?.message}
              {...register("location.country")}
            />
            <TextField
              label="City"
              hint="Max 10 characters"
              error={errors.location?.city?.message}
              {...register("location.city")}
            />
          </div>
          <TextArea
            label="Description"
            rows={3}
            hint="10–100 characters"
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Website"
              hint="Optional"
              placeholder="https://…"
              error={errors.website?.message}
              {...register("website")}
            />
            <TextField
              label="LinkedIn"
              hint="Optional"
              placeholder="https://linkedin.com/company/…"
              error={errors.linkedin?.message}
              {...register("linkedin")}
            />
          </div>
          <TextField
            label="Founded"
            type="date"
            hint="Optional"
            error={errors.foundedAt?.message}
            {...register("foundedAt")}
          />

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={goToDocs}>
              Continue
            </Button>
          </div>
        </div>

        <div className={step === 2 ? "space-y-5" : "hidden"}>
          <p className="text-sm text-ink-subtle">
            Upload your official documents. PDF, DOC, or image — up to 10MB each.
          </p>
          <DocField
            label="Commercial registration"
            file={commercialRegistration}
            onPick={setCommercialRegistration}
            onClear={() => setCommercialRegistration(null)}
          />
          <DocField
            label="Tax card"
            file={taxCard}
            onPick={setTaxCard}
            onClear={() => setTaxCard(null)}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="submit" disabled={apply.isPending}>
              {apply.isPending ? "Submitting…" : "Submit application"}
            </Button>
          </div>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-ink-tertiary">
        By applying you agree HireHub may review your documents.{" "}
        <Link href="/" className="text-ink-subtle hover:text-ink">
          Back home
        </Link>
      </p>
    </Shell>
  );
}
