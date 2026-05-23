import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { logoutController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

export const userRouter: Router = Router();

userRouter.post(ROUTES.USER.LOGOUT,auth, logoutController);
