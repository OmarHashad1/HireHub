import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { ROUTES } from "../../routes.js";
import {
  googleCallbackController,
  loginController,
  refreshTokenController,
  signupController,
} from "./auth.controller.js";
import { loginSchema, signupSchema } from "../../schemas/auth.schema.js";
import passport from "passport";
import { auth } from "../../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post(
  ROUTES.AUTH.SIGNUP,
  validate({ body: signupSchema }),
  signupController,
);

authRouter.post(
  ROUTES.AUTH.LOGIN,
  validate({ body: loginSchema }),
  loginController,
);

authRouter.get(
  ROUTES.AUTH.GOOGLE_LOGIN,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
  ROUTES.AUTH.GOOGLE_CALLBACK,
  passport.authenticate("google", { session: false }),
  googleCallbackController,
);

authRouter.get(ROUTES.AUTH.REFRESH_TOKEN, refreshTokenController);
