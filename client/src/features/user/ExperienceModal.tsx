"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { TextField, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { experienceSchema, type ExperienceValues } from "@/schemas/user";
import { useAddExperience, useUpdateExperience } from "@/features/user/api";
import type { Experience } from "@/lib/session";

function dateInput(value?: string | null) {
  if (!value) return "";
  try {
    return format(new Date(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function ExperienceModal({
  open,
  onClose,
  experience,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits this entry instead of adding a new one. */
  experience?: Experience;
}) {
  const add = useAddExperience();
  const update = useUpdateExperience();
  const isEdit = !!experience;
  const pending = add.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(experienceSchema) });
  const current = watch("current");

  // Prefill (or clear) whenever the modal opens or the target entry changes.
  useEffect(() => {
    if (!open) return;
    reset(
      experience
        ? {
            title: experience.title,
            company: experience.company,
            startDate: dateInput(experience.startDate) as unknown as Date,
            endDate: dateInput(experience.endDate) as unknown as Date,
            current: experience.current,
            description: experience.description ?? "",
          }
        : {
            title: "",
            company: "",
            startDate: undefined,
            endDate: undefined,
            current: false,
            description: "",
          },
    );
  }, [open, experience, reset]);

  const submit = (values: ExperienceValues) => {
    const done = () => {
      reset();
      onClose();
    };
    if (experience) {
      update.mutate({ id: experience._id, values }, { onSuccess: done });
    } else {
      add.mutate(values, { onSuccess: done });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit experience" : "Add experience"}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Title"
            error={errors.title?.message}
            {...register("title")}
          />
          <TextField
            label="Company"
            error={errors.company?.message}
            {...register("company")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Start date"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <TextField
            label="End date"
            type="date"
            disabled={current}
            {...register("endDate")}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" {...register("current")} className="accent-primary" />
          I currently work here
        </label>
        <TextArea
          label="Description"
          rows={3}
          {...register("description")}
          error={errors.description?.message}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Add experience"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
