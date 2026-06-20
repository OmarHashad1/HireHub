import * as z from "zod";

export const createApplicationSchema = z
  .strictObject({
    coverLetter: z.string().min(1).max(1000).optional(),
  })
  .optional();

export type createApplicationDTO = z.infer<typeof createApplicationSchema>;
