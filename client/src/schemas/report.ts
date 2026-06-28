import { z } from "zod";
import { REPORT_REASON, APPLICANT_REPORT_REASON } from "./enums";

export const companyReportSchema = z
  .object({
    reason: z.enum(REPORT_REASON),
    otherReason: z.string().min(10).max(100).optional(),
    details: z.string().min(10, "At least 10 characters").max(100),
  })
  .refine((d) => d.reason !== "other" || !!d.otherReason, {
    message: "Describe the reason (10–100 characters)",
    path: ["otherReason"],
  });

export type CompanyReportValues = z.infer<typeof companyReportSchema>;

export const applicantReportSchema = z
  .object({
    reason: z.enum(APPLICANT_REPORT_REASON),
    otherReason: z.string().min(10).max(100).optional(),
    details: z.string().min(10, "At least 10 characters").max(100),
  })
  .refine((d) => d.reason !== "other" || !!d.otherReason, {
    message: "Describe the reason (10–100 characters)",
    path: ["otherReason"],
  });

export type ApplicantReportValues = z.infer<typeof applicantReportSchema>;
