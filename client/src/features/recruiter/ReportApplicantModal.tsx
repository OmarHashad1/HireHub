"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicantReportSchema,
  type ApplicantReportValues,
} from "@/schemas/report";
import { APPLICANT_REPORT_REASON } from "@/schemas/enums";
import { titleCase } from "@/lib/utils";
import { useReportUser } from "@/features/recruiter/api";
import { Modal } from "@/components/ui/Modal";
import { TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

// Mounted on demand; the reported user's id + the reporting company's id are
// fixed props, so the form only collects reason/details.
export function ReportApplicantModal({
  userId,
  companyId,
  applicantName,
  onClose,
}: {
  userId: string;
  companyId: string;
  applicantName: string;
  onClose: () => void;
}) {
  const report = useReportUser();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(applicantReportSchema) });
  const reason = watch("reason");

  const submit = (values: ApplicantReportValues) => {
    report.mutate(
      { userId, payload: { ...values, companyId } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Report applicant"
      description={`Flag an issue with ${applicantName}`}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <SelectField
          label="Reason"
          defaultValue=""
          error={errors.reason?.message}
          {...register("reason")}
        >
          <option value="" disabled>
            Select a reason
          </option>
          {APPLICANT_REPORT_REASON.map((r) => (
            <option key={r} value={r}>
              {titleCase(r)}
            </option>
          ))}
        </SelectField>

        {reason === "other" && (
          <TextArea
            label="Describe the reason"
            rows={2}
            error={errors.otherReason?.message}
            {...register("otherReason")}
            placeholder="What's the issue?"
          />
        )}

        <TextArea
          label="Details"
          rows={4}
          hint="10–100 characters"
          error={errors.details?.message}
          {...register("details")}
          placeholder="Give the moderators enough context to act."
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={report.isPending}
            className="bg-error hover:bg-error/90"
          >
            {report.isPending ? "Submitting…" : "Submit report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
