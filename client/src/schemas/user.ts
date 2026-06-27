import { z } from "zod";
import { EDUCATION_LEVEL } from "./enums";
import { otp } from "./_shared";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

export const experienceSchema = z.object({
  title: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  current: z.boolean().optional(),
  description: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
});

export const educationSchema = z.object({
  level: z.enum(EDUCATION_LEVEL),
  institution: z.string().min(1).max(150),
  field: z.string().min(1).max(150),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(2).max(30).optional(),
    lastName: z.string().min(2).max(30).optional(),
    socialMedia: z
      .object({
        github: z.string().url().optional().or(z.literal("")),
        leetcode: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        portfolio: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
    bio: z.string().max(500).optional(),
    headline: z.string().max(120).optional(),
    skills: z.array(z.string()).optional(),
    DOB: z.coerce.date().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field is required");

export const sendChangeEmailOtpSchema = z.object({ email: z.string().email() });
export const changeEmailSchema = z.object({ email: z.string().email(), otp });
export const deleteAccountSchema = z.object({ otp });

export type ExperienceValues = z.infer<typeof experienceSchema>;
export type EducationValues = z.infer<typeof educationSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
