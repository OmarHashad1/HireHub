"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyReportSchema, type CompanyReportValues } from "@/schemas/report";
import { REPORT_REASON } from "@/schemas/enums";
import { titleCase } from "@/lib/utils";
import { useReportCompany } from "@/features/reports/api";
import { Modal } from "@/components/ui/Modal";
import { TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ReportCompanyModal({
  companyId,
  companyName,
  open,
  onClose,
}: {
  companyId: string;
  companyName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const report = useReportCompany(companyId);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(companyReportSchema) });
  const reason = watch("reason");

  const submit = (values: CompanyReportValues) => {
    report.mutate(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report company"
      description={
        companyName ? `Flag an issue with ${companyName}` : "Flag an issue with this company"
      }
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
          {REPORT_REASON.map((r) => (
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
