import { z } from "zod";
import { JOB_TYPE, EXPERIENCE_LEVEL, CURRENCY } from "./enums";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null ? undefined : v;

const optionalNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().optional(),
);

// The form uses flat fields (easiest with react-hook-form); JobFormModal maps
// these to the nested { location, salary } DTO the API expects.
export const jobFormSchema = z
  .object({
    title: z
      .string()
      .min(4, "At least 4 characters")
      .max(20, "At most 20 characters"),
    description: z
      .string()
      .min(10, "At least 10 characters")
      .max(1000, "At most 1000 characters"),
    type: z.enum(JOB_TYPE),
    experienceLevel: z.enum(EXPERIENCE_LEVEL),
    requirements: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    isRemote: z.boolean(),
    city: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
    country: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
    salaryMin: optionalNumber,
    salaryMax: optionalNumber,
    currency: z.enum(CURRENCY).optional(),
    deadline: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
    autoReject: z.boolean().optional(),
    aiThreshold: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0).max(100).optional(),
    ),
  })
  .refine((d) => d.isRemote || (!!d.city && !!d.country), {
    message: "City and country are required for on-site roles",
    path: ["city"],
  })
  .refine(
    (d) => d.salaryMin == null || d.salaryMax == null || d.salaryMax >= d.salaryMin,
    { message: "Max must be greater than or equal to min", path: ["salaryMax"] },
  )
  .refine((d) => !d.autoReject || d.aiThreshold != null, {
    message: "Set an AI threshold to enable auto-reject",
    path: ["aiThreshold"],
  });

export type JobFormValues = z.infer<typeof jobFormSchema>;
