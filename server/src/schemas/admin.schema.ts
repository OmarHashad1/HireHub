import { z } from "zod";
import { USER_STATUS } from "../enums/user.enums.js";
import { COMPANY_STATUS } from "../enums/company.enums.js";
import { JOB_STATUS } from "../enums/job.enums.js";
import { REPORT_STATUS } from "../enums/report.enums.js";

export const updateUserStatusSchema = z
  .strictObject({
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.BANNED]),
    banReason: z.string().optional(),
  })
  .refine((doc) => doc.status != USER_STATUS.BANNED || !!doc.banReason, {
    message: "Ban reason must be provided when ban a user",
  });

export type updateUserStatusDTO = z.infer<typeof updateUserStatusSchema>;

export const updateCompanyStatusSchema = z
  .strictObject({
    status: z.enum([COMPANY_STATUS.ACTIVE, COMPANY_STATUS.SUSPENDED]),
    suspendReason: z.string().optional(),
  })
  .refine(
    (doc) => doc.status != COMPANY_STATUS.SUSPENDED || !!doc.suspendReason,
    {
      message: "Suspend reason must be provided when suspending a company",
    },
  );

export type updateCompanyStatusDTO = z.infer<typeof updateCompanyStatusSchema>;

export const updateJobStatusSchema = z.strictObject({
  status: z.enum([JOB_STATUS.FLAGGED, JOB_STATUS.PUBLISHED]),
});

export type updateJobStatusDTO = z.infer<typeof updateJobStatusSchema>;

export const updateReportStatusSchema = z.strictObject({
  status: z.enum([REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED]),
  resolutionNote: z.string().optional(),
});

export type updateReportStatusDTO = z.infer<typeof updateReportStatusSchema>;
