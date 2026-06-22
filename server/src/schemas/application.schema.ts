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
    rejectionReason: z.string().min(3).optional(),
    recruiterNotes: z.string().optional(),
  })
  .refine(
    (doc) => doc.status != APPLICATION_STATUS.REJECTED || !!doc.rejectionReason,
    { message: "Rejection reason must be provide for rejected applicants" },
  ).refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided to update",
  });
export type createApplicationDTO = z.infer<typeof createApplicationSchema>;
export type updateApplicationDTO = z.infer<typeof updateApplicationSchema>;
