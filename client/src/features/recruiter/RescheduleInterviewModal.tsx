"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { SelectField, TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  rescheduleInterviewSchema,
  type RescheduleInterviewValues,
} from "@/schemas/interview";
import { INTERVIEW_TYPE } from "@/schemas/enums";
import { INTERVIEW_TYPE_LABEL, type Interview } from "@/lib/types";
import { useUpdateInterview } from "@/features/recruiter/api";

export function RescheduleInterviewModal({
  open,
  onClose,
  interview,
}: {
  open: boolean;
  onClose: () => void;
  interview: Interview | null;
}) {
  const update = useUpdateInterview();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rescheduleInterviewSchema),
  });

  useEffect(() => {
    if (!open || !interview) return;
    reset({
      type: interview.type,
      // datetime-local wants local wall-clock time, no timezone suffix.
      scheduledAt: format(new Date(interview.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
    });
  }, [open, interview, reset]);

  if (!interview) return null;

  const submit = (values: RescheduleInterviewValues) => {
    update.mutate(
      {
        id: interview._id,
        payload: {
          type: values.type,
          scheduledAt: new Date(values.scheduledAt).toISOString(),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Reschedule interview">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <SelectField
          label="Type"
          error={errors.type?.message}
          {...register("type")}
        >
          {INTERVIEW_TYPE.map((t) => (
            <option key={t} value={t}>
              {INTERVIEW_TYPE_LABEL[t]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Date & time"
          type="datetime-local"
          error={errors.scheduledAt?.message}
          {...register("scheduledAt")}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Reschedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
