import { z } from "zod";
import { USER_STATUS } from "../enums/user.enums.js";

export const updateUserStatusSchema = z
  .strictObject({
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.BANNED]),
    banReason: z.string().optional(),
  })
  .refine((doc) => doc.status != USER_STATUS.BANNED || !!doc.banReason, {
    message: "Ban reason must be provided when ban a user",
  });

export type updateUserStatusDTO = z.infer<typeof updateUserStatusSchema>;
