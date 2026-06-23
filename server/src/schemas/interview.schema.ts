import { z } from "zod";
import { INTERVIEW_STATUS, INTERVIEW_TYPE } from "../enums/interview.enums.js";

const idSchema = {
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id" }),
};
export const scheduleInterviewSchema = z.strictObject({
  application: idSchema.id,
  type: z.enum([...Object.values(INTERVIEW_TYPE)]),
  scheduledAt: z.iso
    .datetime({ offset: true })
    .pipe(z.coerce.date())
    .refine((val) => val >= new Date(), {
      message: "Interview date can't be in the past",
    })
    .refine((val) => val.getTime() >= Date.now() + 60 * 60 * 1000, {
      message: "Interview must be scheduled at least 1 hour in advance",
    })
    .refine((val) => val.getTime() <= Date.now() + 90 * 24 * 60 * 60 * 1000, {
      message: "Interview can't be scheduled more than 90 days in advance",
    }),
});

export const updateScheduledInterviewSchema = z
  .strictObject({
    type: z.enum([INTERVIEW_TYPE.IN_PERSON, INTERVIEW_TYPE.ONLINE]).optional(),
    scheduledAt: z.iso
      .datetime({ offset: true })
      .pipe(z.coerce.date())
      .refine((val) => val >= new Date(), {
        message: "Interview date can't be in the past",
      })
      .refine((val) => val.getTime() >= Date.now() + 60 * 60 * 1000, {
        message: "Interview must be scheduled at least 1 hour in advance",
      })
      .refine((val) => val.getTime() <= Date.now() + 90 * 24 * 60 * 60 * 1000, {
        message: "Interview can't be scheduled more than 90 days in advance",
      })
      .optional(),
    status: z
      .enum([INTERVIEW_STATUS.CANCELLED, INTERVIEW_STATUS.COMPLETED])
      .optional(),
    cancellationReason: z.string().nullish(),
  })
  .refine(
    (doc) =>
      doc.status != INTERVIEW_STATUS.CANCELLED || !!doc.cancellationReason,
    {
      message:
        "Cancellation reason must be provided when cancelling the interview",
      path: ["cancellationReason"],
    },
  )
  .refine((doc) => Object.keys(doc).length > 0, {
    message: "At least one field must be provided to update",
  });

export type scheduleInterviewDTO = z.infer<typeof scheduleInterviewSchema>;
export type updateScheduledInterviewDTO = z.infer<
  typeof updateScheduledInterviewSchema
>;
