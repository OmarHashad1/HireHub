import * as z from "zod";

export const signupSchema = z.strictObject({
  firstName: z.string().min(3).max(30),
  lastName: z.string().min(3).max(30),
  email: z.string().email(),
  age: z.coerce.number(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, {
      error: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { error: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      error: "Password must contain at least one special character",
    }),
  phoneNumber: z.string().min(7).max(20),
  avatar: z.string().optional(),
  headline: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  socialMedia: z
    .object({
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
      leetcode: z.string().url().optional(),
      portfolio: z.string().url().optional(),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
});

export const loginSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(3),
});

export type SignupDTO = z.infer<typeof signupSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
