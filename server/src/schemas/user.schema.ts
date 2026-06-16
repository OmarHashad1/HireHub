import * as z from "zod";
import { EDUCATION_LEVEL } from "../enums/user.enums.js";

export const objectIdParamSchema = z.strictObject({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id" }),
});

export const experienceSchema = z.strictObject({
  title: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullish(),
  current: z.boolean().optional(),
  description: z.string().max(1000).nullish(),
});

export const updateExperienceSchema = z
  .strictObject({
    title: z.string().min(1).max(100).optional(),
    company: z.string().min(1).max(100).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullish(),
    current: z.boolean().optional(),
    description: z.string().max(1000).nullish(),
  })
  .refine((doc) => Object.keys(doc).length > 0, {
    message: "At least one field should be provided",
  });

export const educationSchema = z.strictObject({
  level: z.enum(EDUCATION_LEVEL),
  institution: z.string().min(1).max(150),
  field: z.string().min(1).max(150),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const updateEducationSchema = z
  .strictObject({
    level: z.enum(EDUCATION_LEVEL).optional(),
    institution: z.string().min(1).max(150).optional(),
    field: z.string().min(1).max(150).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((doc) => Object.keys(doc).length > 0, {
    message: "At least one field should be provided",
  });

export const updateProfileSchema = z
  .strictObject({
    firstName: z.string().min(2).max(30).optional(),
    lastName: z.string().min(2).max(30).optional(),
    socialMedia: z
      .strictObject({
        github: z.url().optional(),
        leetcode: z.url().optional(),
        linkedin: z.url().optional(),
        portfolio: z.url().optional(),
      })
      .optional(),
    bio: z.string().max(500).optional(),
    headline: z.string().max(120).optional(),
    skills: z.array(z.string()).optional(),
    DOB: z.coerce.date().optional(),
  })
  .refine((doc) => Object.keys(doc).length > 0, {
    message: "At least one field should be provided",
  });

export const sendChangeEmailOtpSchema = z.strictObject({
  email: z.email(),
});

export const changeEmailSchema = z.strictObject({
  email: z.email(),
  otp: z.string().length(6),
});

export const deleteAccountSchema = z.strictObject({
  otp: z.string().length(6),
});

export type sendChangeEmailOtpDTO = z.infer<typeof sendChangeEmailOtpSchema>;
export type changeEmailDTO = z.infer<typeof changeEmailSchema>;
export type deleteAccountDTO = z.infer<typeof deleteAccountSchema>;
export type updateProfileDTO = z.infer<typeof updateProfileSchema>;
export type experienceDTO = z.infer<typeof experienceSchema>;
export type educationDTO = z.infer<typeof educationSchema>;
export type objectIdParamDTO = z.infer<typeof objectIdParamSchema>;
export type updateExperienceDTO = z.infer<typeof updateExperienceSchema>;
export type updateEducationceDTO = z.infer<typeof updateEducationSchema>;
