"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { TextField, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { educationSchema, type EducationValues } from "@/schemas/user";
import {
  EDUCATION_LEVEL,
  EDUCATION_LABEL,
  type EducationLevel,
} from "@/schemas/enums";
import { useAddEducation, useUpdateEducation } from "@/features/user/api";
import type { Education } from "@/lib/session";

function dateInput(value?: string | null) {
  if (!value) return "";
  try {
    return format(new Date(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function EducationModal({
  open,
  onClose,
  education,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits this entry instead of adding a new one. */
  education?: Education;
}) {
  const add = useAddEducation();
  const update = useUpdateEducation();
  const isEdit = !!education;
  const pending = add.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(educationSchema) });

  useEffect(() => {
    if (!open) return;
    reset(
      education
        ? {
            level: education.level as EducationLevel,
            institution: education.institution,
            field: education.field,
            from: dateInput(education.from) as unknown as Date,
            to: dateInput(education.to) as unknown as Date,
          }
        : {
            level: undefined,
            institution: "",
            field: "",
            from: undefined,
            to: undefined,
          },
    );
  }, [open, education, reset]);

  const submit = (values: EducationValues) => {
    const done = () => {
      reset();
      onClose();
    };
    if (education) {
      update.mutate({ id: education._id, values }, { onSuccess: done });
    } else {
      add.mutate(values, { onSuccess: done });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit education" : "Add education"}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <SelectField
          label="Level"
          error={errors.level?.message}
          defaultValue=""
          {...register("level")}
        >
          <option value="" disabled>
            Select a level
          </option>
          {EDUCATION_LEVEL.map((lvl) => (
            <option key={lvl} value={lvl}>
              {EDUCATION_LABEL[lvl]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Institution"
          error={errors.institution?.message}
          {...register("institution")}
        />
        <TextField
          label="Field of study"
          error={errors.field?.message}
          {...register("field")}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="From"
            type="date"
            error={errors.from?.message}
            {...register("from")}
          />
          <TextField
            label="To"
            type="date"
            error={errors.to?.message}
            {...register("to")}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Add education"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
