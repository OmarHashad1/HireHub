import * as z from "zod";
import {
  REPORT_REASON,
  APPLICANT_REPORT_REASON,
} from "../enums/report.enums.js";

const reportBase = z.strictObject({
  reason: z.enum([...Object.values(REPORT_REASON)]),
  otherReason: z.string().min(10).max(100).optional(),
  details: z.string().min(10).max(100),
});

const otherReasonRefine = (doc: z.infer<typeof reportBase>) =>
  doc.reason !== REPORT_REASON.OTHER || !!doc.otherReason;

export const companyReportSchema = reportBase.refine(otherReasonRefine, {
  message: "otherReason is required only when reason is OTHER",
  path: ["otherReason"],
});

export const userReportSchema = reportBase
  .extend({
    reason: z.enum([...APPLICANT_REPORT_REASON]),
    companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id" }),
  })
  .refine(otherReasonRefine, {
    message: "otherReason is required only when reason is OTHER",
    path: ["otherReason"],
  });

export type companyReportDTO = z.infer<typeof companyReportSchema>;
export type userReportDTO = z.infer<typeof userReportSchema>;
