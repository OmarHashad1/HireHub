import { z } from "zod";

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const phone = z
  .string()
  .min(7)
  .max(20)
  .regex(/^\+[1-9]\d{6,14}$/, "Phone must start with + and a valid country code");

export const strongPassword = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

export const otp = z.string().length(6, "Enter the 6-digit code");

const MB = 1024 * 1024;

export const fileSchema = (maxMB: number, mimes: readonly string[]) =>
  z
    .instanceof(File)
    .refine((f) => f.size <= maxMB * MB, `Max file size is ${maxMB}MB`)
    .refine((f) => mimes.includes(f.type), "Unsupported file type");

export const DOC_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const IMG_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export const cvFile = fileSchema(2, DOC_MIME);
export const avatarFile = fileSchema(2, IMG_MIME);
export const companyDocFile = fileSchema(10, [...DOC_MIME, "image/jpeg", "image/png"]);
