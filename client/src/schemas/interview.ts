import { z } from "zod";
import { INTERVIEW_TYPE } from "./enums";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const scheduledAt = z.coerce
  .date()
  .refine((d) => d.getTime() >= Date.now() + HOUR, {
    message: "Must be at least 1 hour from now",
  })
  .refine((d) => d.getTime() <= Date.now() + 90 * DAY, {
    message: "Can't be more than 90 days out",
  });

export const scheduleInterviewSchema = z.object({
  type: z.enum(INTERVIEW_TYPE),
  scheduledAt,
});

export const rescheduleInterviewSchema = z.object({
  type: z.enum(INTERVIEW_TYPE),
  scheduledAt,
});

export type ScheduleInterviewValues = z.infer<typeof scheduleInterviewSchema>;
export type RescheduleInterviewValues = z.infer<
  typeof rescheduleInterviewSchema
>;
