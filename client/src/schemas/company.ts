import { z } from "zod";
import { phone } from "./_shared";
import { INDUSTRY, COMPANY_SIZE, COMPANY_BENEFIT } from "./enums";

const optionalUrl = z
  .string()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""));

export const updateCompanyProfileSchema = z.object({
  name: z.string().min(1, "Required").max(50),
  industry: z.enum(INDUSTRY),
  size: z.enum(COMPANY_SIZE),
  location: z.object({
    city: z.string().min(1, "Required").max(50),
    country: z.string().min(1, "Required").max(50),
  }),
  description: z.string().min(10, "At least 10 characters").max(100),
  website: optionalUrl,
  benefits: z.array(z.enum(COMPANY_BENEFIT)).optional(),
  socialMedia: z.object({
    twitter: optionalUrl,
    linkedin: optionalUrl,
    facebook: optionalUrl,
    instagram: optionalUrl,
  }),
});

export type UpdateCompanyProfileValues = z.infer<
  typeof updateCompanyProfileSchema
>;

export const companyApplicationSchema = z.object({
  companyName: z.string().min(1, "Required").max(25),
  companyEmail: z.string().email("Enter a valid email"),
  contactPhone: phone,
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  industry: z.enum(INDUSTRY),
  size: z.enum(COMPANY_SIZE),
  location: z.object({
    country: z.string().min(1, "Required").max(10),
    city: z.string().min(1, "Required").max(10),
  }),
  description: z.string().min(10, "At least 10 characters").max(100),
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  foundedAt: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce
      .date()
      .max(new Date(), "Founded date can't be in the future")
      .optional(),
  ),
});

export type CompanyApplicationValues = z.infer<typeof companyApplicationSchema>;
