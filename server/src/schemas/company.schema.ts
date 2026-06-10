import * as z from "zod";
import { PHONE_REGEX } from "../utils/regex.util.js";
import { COMPANY_SIZE, INDUSTRY } from "../enums/companyApplication.enums.js";
import { mutlerFileSchema } from "./global.schema.js";

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
});

export const companyApplicationFileFieldsSchema = z.strictObject({
  taxCard: z.array(mutlerFileSchema).length(1),
  commercialRegistration: z.array(mutlerFileSchema).length(1),
});
export type companyApplicationDTO = z.infer<typeof companyApplicationSchema>;
export { mutlerFileSchema };
