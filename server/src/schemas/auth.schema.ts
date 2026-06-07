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

export const confirmEmail = z.strictObject({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const sendVerifyEmailSchema = z.strictObject({
  email: z.string().email(),
});

export const sendforgotPassowrdOtpSchema = z.strictObject({
  email: z.string().email(),
});

export const checkForgotPasswordOtpSchema = z.strictObject({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.strictObject({
  email: z.string().email(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, {
      error: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { error: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      error: "Password must contain at least one special character",
    }),
});

export const changePasswordSchema = z.strictObject({

  password: z.string().min(3),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, {
      error: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { error: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      error: "Password must contain at least one special character",
    }),
});

export type SignupDTO = z.infer<typeof signupSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
export type confirmEmailDTO = z.infer<typeof confirmEmail>;
export type sendVerifyEmailDTO = z.infer<typeof sendVerifyEmailSchema>;
export type sendforgotPassowrdOtpDTO = z.infer<
  typeof sendforgotPassowrdOtpSchema
>;
export type checkForgotPasswordOtpDTO = z.infer<
  typeof checkForgotPasswordOtpSchema
>;
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type changePasswordDTO = z.infer<typeof changePasswordSchema>;
