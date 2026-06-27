"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  updateCompanyProfileSchema,
  type UpdateCompanyProfileValues,
} from "@/schemas/company";
import { INDUSTRY, COMPANY_SIZE, COMPANY_BENEFIT } from "@/schemas/enums";
import {
  INDUSTRY_LABEL,
  BENEFIT_LABEL,
  type CompanyProfile,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUpdateCompanyProfile } from "@/features/recruiter/api";

export function CompanyProfileModal({
  open,
  onClose,
  company,
}: {
  open: boolean;
  onClose: () => void;
  company: CompanyProfile;
}) {
  const update = useUpdateCompanyProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateCompanyProfileValues>({
    resolver: zodResolver(updateCompanyProfileSchema),
  });

  const benefits = watch("benefits") ?? [];

  useEffect(() => {
    if (!open) return;
    reset({
      name: company.name,
      industry: company.industry as UpdateCompanyProfileValues["industry"],
      size: company.size as UpdateCompanyProfileValues["size"],
      location: {
        city: company.location?.city ?? "",
        country: company.location?.country ?? "",
      },
      description: company.description,
      website: company.website ?? "",
      benefits: (company.benefits ??
        []) as UpdateCompanyProfileValues["benefits"],
      socialMedia: {
        twitter: company.socialMedia?.twitter ?? "",
        linkedin: company.socialMedia?.linkedin ?? "",
        facebook: company.socialMedia?.facebook ?? "",
        instagram: company.socialMedia?.instagram ?? "",
      },
    });
  }, [open, company, reset]);

  const toggleBenefit = (benefit: string) => {
    const next = benefits.includes(
      benefit as NonNullable<UpdateCompanyProfileValues["benefits"]>[number],
    )
      ? benefits.filter((b) => b !== benefit)
      : [
          ...benefits,
          benefit as NonNullable<
            UpdateCompanyProfileValues["benefits"]
          >[number],
        ];
    setValue("benefits", next);
  };

  const submit = (values: UpdateCompanyProfileValues) => {
    // The API rejects empty-string URLs, so only send URL fields that are set.
    const social: Record<string, string> = {};
    for (const [key, val] of Object.entries(values.socialMedia)) {
      if (val && val.trim()) social[key] = val.trim();
    }

    const payload: Record<string, unknown> = {
      name: values.name,
      industry: values.industry,
      size: values.size,
      location: values.location,
      description: values.description,
      benefits: values.benefits ?? [],
    };
    if (values.website && values.website.trim())
      payload.website = values.website.trim();
    if (Object.keys(social).length) payload.socialMedia = social;

    update.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit company profile"
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <TextField
          label="Company name"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Industry"
            error={errors.industry?.message}
            {...register("industry")}
          >
            {INDUSTRY.map((i) => (
              <option key={i} value={i}>
                {INDUSTRY_LABEL[i] ?? i}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Company size"
            error={errors.size?.message}
            {...register("size")}
          >
            {COMPANY_SIZE.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="City"
            error={errors.location?.city?.message}
            {...register("location.city")}
          />
          <TextField
            label="Country"
            error={errors.location?.country?.message}
            {...register("location.country")}
          />
        </div>

        <TextArea
          label="Description"
          rows={3}
          hint="10–100 characters"
          error={errors.description?.message}
          {...register("description")}
        />

        <TextField
          label="Website"
          placeholder="https://…"
          error={errors.website?.message}
          {...register("website")}
        />

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-muted">Benefits</p>
          <div className="grid grid-cols-2 gap-1.5">
            {COMPANY_BENEFIT.map((benefit) => {
              const active = benefits.includes(benefit);
              return (
                <button
                  key={benefit}
                  type="button"
                  onClick={() => toggleBenefit(benefit)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-left text-[12px] transition-colors",
                    active
                      ? "border-primary/50 bg-primary/10 text-ink"
                      : "border-hairline bg-surface-1 text-ink-subtle hover:text-ink",
                  )}
                >
                  {BENEFIT_LABEL[benefit] ?? benefit}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="LinkedIn"
            placeholder="https://…"
            error={errors.socialMedia?.linkedin?.message}
            {...register("socialMedia.linkedin")}
          />
          <TextField
            label="Twitter"
            placeholder="https://…"
            error={errors.socialMedia?.twitter?.message}
            {...register("socialMedia.twitter")}
          />
          <TextField
            label="Facebook"
            placeholder="https://…"
            error={errors.socialMedia?.facebook?.message}
            {...register("socialMedia.facebook")}
          />
          <TextField
            label="Instagram"
            placeholder="https://…"
            error={errors.socialMedia?.instagram?.message}
            {...register("socialMedia.instagram")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
