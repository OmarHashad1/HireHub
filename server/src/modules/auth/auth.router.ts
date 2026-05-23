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
import { authLimiter } from "../../utils/limiter.util.js";
import { auth } from "../../middlewares/auth.middleware.js";

export const authRouter: Router = Router();

authRouter.post(
  ROUTES.AUTH.SIGNUP,
  authLimiter,
  validate({ body: signupSchema }),
  signupController,
);

authRouter.post(
  ROUTES.AUTH.LOGIN,
  authLimiter,
  validate({ body: loginSchema }),
  loginController,
);

authRouter.get(
  ROUTES.AUTH.GOOGLE_LOGIN,
  authLimiter,

  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
  ROUTES.AUTH.GOOGLE_CALLBACK,
  authLimiter,
  passport.authenticate("google", { session: false }),
  googleCallbackController,
);

authRouter.get(ROUTES.AUTH.REFRESH_TOKEN, authLimiter, auth,refreshTokenController);
