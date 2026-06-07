import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { changeAvatarController, logoutController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../utils/multer.utils.js";

export const userRouter: Router = Router();

userRouter.post(ROUTES.USER.LOGOUT, auth, logoutController);
userRouter.patch(
  ROUTES.USER.CHANGE_AVATAR,
  auth,
  uploadAvatar.single("avatar"),
  changeAvatarController,
);
