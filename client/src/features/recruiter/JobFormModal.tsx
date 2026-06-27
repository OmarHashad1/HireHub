"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SkillsInput } from "@/components/ui/SkillsInput";
import { jobFormSchema, type JobFormValues } from "@/schemas/job";
import {
  JOB_TYPE,
  EXPERIENCE_LEVEL,
  CURRENCY,
} from "@/schemas/enums";
import { JOB_TYPE_LABEL, EXPERIENCE_LABEL, type Job } from "@/lib/types";
import {
  useCreateJob,
  useUpdateJob,
  type JobPayload,
} from "@/features/recruiter/api";

function dateInput(value?: string | null) {
  if (!value) return "";
  try {
    return format(new Date(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function JobFormModal({
  open,
  onClose,
  job,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, edits this job instead of creating a new one. */
  job?: Job;
}) {
  const create = useCreateJob();
  const update = useUpdateJob();
  const isEdit = !!job;
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(jobFormSchema) });

  const isRemote = watch("isRemote");
  const autoReject = watch("autoReject");
  const skills = watch("skills") ?? [];
  const requirements = watch("requirements") ?? [];

  useEffect(() => {
    if (!open) return;
    reset({
      title: job?.title ?? "",
      description: job?.description ?? "",
      type: job?.type ?? "full-time",
      experienceLevel: job?.experienceLevel ?? "mid",
      skills: job?.skills ?? [],
      requirements: job?.requirements ?? [],
      isRemote: job?.location.isRemote ?? false,
      city: job?.location.city ?? "",
      country: job?.location.country ?? "",
      salaryMin: (job?.salary?.min ?? "") as unknown as number,
      salaryMax: (job?.salary?.max ?? "") as unknown as number,
      currency: (job?.salary?.currency ??
        "EGP") as JobFormValues["currency"],
      deadline: dateInput(job?.deadline) as unknown as Date,
      autoReject: job?.autoReject ?? false,
      aiThreshold: (job?.aiThreshold ?? "") as unknown as number,
    });
  }, [open, job, reset]);

  // `status` is only meaningful when creating; on edit it's left untouched so
  // a published job stays published (use the jobs list to move it to draft).
  const submit = (values: JobFormValues, status?: "draft" | "published") => {
    const hasSalary = values.salaryMin != null || values.salaryMax != null;
    const payload: JobPayload = {
      title: values.title,
      description: values.description,
      type: values.type,
      experienceLevel: values.experienceLevel,
      requirements: values.requirements?.length
        ? values.requirements
        : undefined,
      skills: values.skills?.length ? values.skills : undefined,
      location: {
        isRemote: values.isRemote,
        ...(values.isRemote
          ? {}
          : { city: values.city, country: values.country }),
      },
      salary: hasSalary
        ? {
            min: values.salaryMin ?? undefined,
            max: values.salaryMax ?? undefined,
            currency: values.currency,
          }
        : undefined,
      deadline: values.deadline
        ? new Date(values.deadline).toISOString()
        : undefined,
      autoReject: values.autoReject ?? false,
      aiThreshold: values.aiThreshold ?? undefined,
    };

    const done = () => {
      reset();
      onClose();
    };
    if (job) update.mutate({ id: job._id, payload }, { onSuccess: done });
    else create.mutate({ ...payload, status }, { onSuccess: done });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit job" : "Post a new job"}
      description="Published roles appear on the public job board."
      size="lg"
    >
      <form
        onSubmit={handleSubmit((v) => submit(v))}
        className="space-y-4"
      >
        <TextField
          label="Title"
          hint="4–20 characters"
          error={errors.title?.message}
          {...register("title")}
        />
        <TextArea
          label="Description"
          rows={4}
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Employment type"
            error={errors.type?.message}
            {...register("type")}
          >
            {JOB_TYPE.map((t) => (
              <option key={t} value={t}>
                {JOB_TYPE_LABEL[t]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Experience level"
            error={errors.experienceLevel?.message}
            {...register("experienceLevel")}
          >
            {EXPERIENCE_LEVEL.map((lvl) => (
              <option key={lvl} value={lvl}>
                {EXPERIENCE_LABEL[lvl]}
              </option>
            ))}
          </SelectField>
        </div>

        <SkillsInput
          value={skills}
          onChange={(next) => setValue("skills", next)}
          label="Skills"
        />
        <SkillsInput
          value={requirements}
          onChange={(next) => setValue("requirements", next)}
          label="Requirements"
        />

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            {...register("isRemote")}
            className="accent-primary"
          />
          This role is fully remote
        </label>
        {!isRemote && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="City"
              error={errors.city?.message}
              {...register("city")}
            />
            <TextField
              label="Country"
              error={errors.country?.message}
              {...register("country")}
            />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            label="Min salary"
            type="number"
            inputMode="numeric"
            {...register("salaryMin")}
          />
          <TextField
            label="Max salary"
            type="number"
            inputMode="numeric"
            error={errors.salaryMax?.message}
            {...register("salaryMax")}
          />
          <SelectField label="Currency" {...register("currency")}>
            {CURRENCY.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          label="Application deadline"
          type="date"
          hint="Optional"
          {...register("deadline")}
        />

        <div className="rounded-lg border border-hairline bg-surface-2/30 p-4">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              {...register("autoReject")}
              className="accent-primary"
            />
            Auto-reject applicants below an AI score
          </label>
          {autoReject && (
            <div className="mt-3">
              <TextField
                label="AI threshold (0–100)"
                type="number"
                inputMode="numeric"
                error={errors.aiThreshold?.message}
                {...register("aiThreshold")}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {isEdit ? (
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={handleSubmit((v) => submit(v, "draft"))}
              >
                Save as draft
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={handleSubmit((v) => submit(v, "published"))}
              >
                {pending ? "Saving…" : "Publish"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
