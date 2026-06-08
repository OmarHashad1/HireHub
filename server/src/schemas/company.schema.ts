import * as z from "zod";
import { PHONE_REGEX } from "../utils/regex.util.js";
import { COMPANY_SIZE, INDUSTRY } from "../enums/companyApplication.enums.js";

export const companyApplicationSchema = z.strictObject({
  companyName: z.string().max(25),
  companyEmail: z.email(),
  phone: z.string().min(7).max(20).regex(PHONE_REGEX, {
    error:
      "Phone number must start with + followed by a valid country code and number",
  }),
  website: z.url(),
  industry: z.enum([...Object.values(INDUSTRY)]),
  size: z.enum([...Object.values(COMPANY_SIZE)]),
  location: z.object({
    country: z.string().min(1).max(10),
    city: z.string().min(1).max(10),
  }),
  description: z.string().min(10).max(100),
  documents: z.object({
    commercialRegistration: z.string(),
    taxCard: z.string(),
  }),
  linkedin: z.url().optional(),
});

export type companyApplicationDTO = z.infer<typeof companyApplicationSchema>;
