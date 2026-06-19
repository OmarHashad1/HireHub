import * as z from "zod";
import {
  CURRENCY,
  EXPERIENCE_LEVEL,
  JOB_STATUS,
  JOB_TYPE,
} from "../enums/job.enums.js";

export const createJobSchema = z.strictObject({
  title: z.string().min(4).max(20),
  description: z.string().min(10).max(1000),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experienceLevel: z.enum([...Object.values(EXPERIENCE_LEVEL)]),
  type: z.enum([...Object.values(JOB_TYPE)]),
  location: z
    .strictObject({
      city: z.string().min(1).nullish(),
      country: z.string().min(1).nullish(),
      isRemote: z.boolean(),
    })
    .refine((loc) => loc.isRemote || (!!loc.city && !!loc.country), {
      message: "city and country are required for non-remote jobs",
    }),
  salary: z
    .strictObject({
      min: z.number().nonnegative().nullish(),
      max: z.number().nonnegative().nullish(),
      currency: z.enum([...Object.values(CURRENCY)]).optional(),
    })
    .refine(
      (sal) => {
        if (sal.max && sal.min && sal.max < sal.min) return false;
        else return true;
      },
      {
        message: "Minimum Salary can't be larger than maximum salary",
        path: ["salary"],
      },
    )
    .optional(),
  status: z
    .enum([JOB_STATUS.PUBLISHED, JOB_STATUS.DRAFT, JOB_STATUS.CLOSED])
    .optional(),
  deadline: z.coerce.date().nullish(),
  aiThreshold: z.number().min(0).max(100).nullish(),
});

export type createJobDTO = z.infer<typeof createJobSchema>;
