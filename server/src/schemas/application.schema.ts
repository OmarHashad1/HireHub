import * as z from "zod";
import { APPLICATION_STATUS } from "../enums/application.enums.js";

export const createApplicationSchema = z
  .strictObject({
    coverLetter: z.string().min(1).max(1000).optional(),
  })
  .optional();

export const updateApplicationSchema = z
  .strictObject({
    status: z
      .enum([
        APPLICATION_STATUS.INTERVIEW,
        APPLICATION_STATUS.REJECTED,
        APPLICATION_STATUS.OFFER,
      ])
      .optional(),
    rejectionReason: z.string().optional,
    recruiterNotes: z.string().optional(),
  })
  .refine(
    (doc) => doc.status != APPLICATION_STATUS.REJECTED || !!doc.rejectionReason,
    { message: "Rejection reason must be provide for rejected applicants" },
  );

export type createApplicationDTO = z.infer<typeof createApplicationSchema>;
