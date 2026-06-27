"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { SelectField, TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  scheduleInterviewSchema,
  type ScheduleInterviewValues,
} from "@/schemas/interview";
import { INTERVIEW_TYPE } from "@/schemas/enums";
import { INTERVIEW_TYPE_LABEL } from "@/lib/types";
import { useScheduleInterview } from "@/features/recruiter/api";

export function ScheduleInterviewModal({
  open,
  onClose,
  applicationId,
  jobId,
  applicantName,
}: {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  jobId: string;
  applicantName: string;
}) {
  const schedule = useScheduleInterview(jobId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduleInterviewSchema),
  });

  const submit = (values: ScheduleInterviewValues) => {
    schedule.mutate(
      {
        application: applicationId,
        type: values.type,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule interview"
      description={`Invite ${applicantName} to interview.`}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <SelectField
          label="Type"
          defaultValue="online"
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
          hint="At least 1 hour from now, within 90 days"
          error={errors.scheduledAt?.message}
          {...register("scheduledAt")}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={schedule.isPending}>
            {schedule.isPending ? "Scheduling…" : "Schedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
