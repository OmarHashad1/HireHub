import { z } from "zod";
import { INTERVIEW_TYPE } from "../enums/interview.enums.js";

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

export type scheduleInterviewDTO = z.infer<typeof scheduleInterviewSchema>;
