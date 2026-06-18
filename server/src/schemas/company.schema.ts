import * as z from "zod";
import { PHONE_REGEX } from "../utils/regex.util.js";
import {
  COMPANY_APPLICATION_STATUS,
  COMPANY_SIZE,
  INDUSTRY,
} from "../enums/companyApplication.enums.js";
import { mutlerFileSchema } from "./global.schema.js";
import { COMPANY_BENEFIT } from "../enums/company.enums.js";

export const companyApplicationSchema = z.strictObject({
  companyName: z.string().max(25),
  companyEmail: z.email(),
  contactPhone: z.string().min(7).max(20).regex(PHONE_REGEX, {
    error:
      "Phone number must start with + followed by a valid country code and number",
  }),
  website: z.url().optional(),
  industry: z.enum([...Object.values(INDUSTRY)]),
  size: z.enum([...Object.values(COMPANY_SIZE)]),
  location: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (err) {
          return val;
        }
      }
      return val;
    },
    z.object({
      country: z.string().min(1).max(10),
      city: z.string().min(1).max(10),
    }),
  ),
  description: z.string().min(10).max(100),

  linkedin: z.url().optional(),
  foundedAt: z.coerce
    .date()
    .max(new Date(), { error: "Founded date cannot be in the future" })
    .optional(),
});

export const companyApplicationFileFieldsSchema = z.strictObject({
  taxCard: z.array(mutlerFileSchema).length(1),
  commercialRegistration: z.array(mutlerFileSchema).length(1),
});

export const updateCompanyProfileSchema = z
  .strictObject({
    name: z.string().min(1).max(50).optional(),
    industry: z.enum(INDUSTRY).optional(),
    size: z.enum(COMPANY_SIZE).optional(),
    location: z
      .strictObject({
        city: z.string().min(1).max(50).optional(),
        country: z.string().min(1).max(50).optional(),
      })
      .optional(),
    description: z.string().min(10).max(100).optional(),
    website: z.url().optional(),
    benefits: z.array(z.enum(COMPANY_BENEFIT)).optional(),
    socialMedia: z
      .strictObject({
        twitter: z.url().optional(),
        linkedin: z.url().optional(),
        facebook: z.url().optional(),
        instagram: z.url().optional(),
      })
      .optional(),
  })
  .refine((doc) => Object.keys(doc).length > 0, {
    message: "At least one field should be provided",
  });

export const updateCompanyApplicationStatusSchema = z
  .strictObject({
    applicationID: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id" }),

    status: z.enum([
      COMPANY_APPLICATION_STATUS.APPROVED,
      COMPANY_APPLICATION_STATUS.REJECTED,
    ]),
    rerejectionReason: z.string().min(5).optional(),
  })
  .refine(
    (data) => {
      if (data.status == COMPANY_APPLICATION_STATUS.REJECTED) {
        return !!data.rerejectionReason;
      }
      return true;
    },
    {
      message: "Rejection reason must be provided",
      path: ["rerejectionReason"],
    },
  );

export const getCompanyJobsSchema = z.strictObject({
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id" }),
});

export type getCompanyJobsDTO = z.infer<typeof getCompanyJobsSchema>;
export type updateCompanyApplicationStatusDTO = z.infer<
  typeof updateCompanyApplicationStatusSchema
>;
export type companyApplicationDTO = z.infer<typeof companyApplicationSchema>;
export type updateCompanyProfileDTO = z.infer<
  typeof updateCompanyProfileSchema
>;
