import { z } from "zod";
import { phone, strongPassword, otp } from "./_shared";

export const signupSchema = z
  .object({
    firstName: z.string().min(3, "At least 3 characters").max(30),
    lastName: z.string().min(3, "At least 3 characters").max(30),
    email: z.string().email("Enter a valid email"),
    DOB: z.coerce.date().optional(),
    password: strongPassword,
    confirmPassword: z.string(),
    phoneNumber: phone,
    headline: z.string().max(100).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(3, "Enter your password"),
});

export const sendVerifyEmailSchema = z.object({ email: z.string().email() });
export const confirmEmailSchema = z.object({ email: z.string().email(), otp });

export const forgotPasswordSchema = z.object({ email: z.string().email() });
export const verifyForgotOtpSchema = z.object({ email: z.string().email(), otp });
export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    password: z.string().min(3, "Enter your current password"),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
