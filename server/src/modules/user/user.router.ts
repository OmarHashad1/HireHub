import { Router } from "express";
import { ROUTES } from "../../routes.js";
import {
  changeAvatarController,
  deleteAvatarController,
  logoutController,
} from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../utils/multer.utils.js";
import { mutlerFileSchema } from "../../schemas/global.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";

export const userRouter: Router = Router();

userRouter.post(ROUTES.USER.LOGOUT, auth, logoutController);

userRouter.patch(
  ROUTES.USER.CHANGE_AVATAR,
  auth,
  uploadAvatar.single("avatar"),
  validate({ file: mutlerFileSchema }),
  changeAvatarController,
);

userRouter.delete(ROUTES.USER.DELETE_AVATAR, auth, deleteAvatarController);
