import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { ROUTES } from "../../routes.js";
import {
  changePasswordController,
  checkForgotPasswordOTPController,
  exchangeGoogleTicketController,
  googleCallbackController,
  loginController,
  refreshTokenController,
  resetPasswordController,
  sendForgotPasswordOTPController,
  sendVerificationEmailController,
  signupController,
  verifyEmailController,
} from "./auth.controller.js";
import {
  changePasswordSchema,
  checkForgotPasswordOtpSchema,
  confirmEmail,
  loginSchema,
  resetPasswordSchema,
  sendforgotPassowrdOtpSchema,
  sendVerifyEmailSchema,
  signupSchema,
} from "../../schemas/auth.schema.js";
import passport from "passport";
import { authLimiter } from "../../utils/limiter.util.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { CLIENT_URL } from "../../configs/env.config.js";

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
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=oauth`,
  }),
  googleCallbackController,
);

authRouter.post(
  ROUTES.AUTH.GOOGLE_EXCHANGE,
  authLimiter,
  exchangeGoogleTicketController,
);

authRouter.post(
  ROUTES.AUTH.SEND_VERIFY_EMAIL,
  authLimiter,
  validate({ body: sendVerifyEmailSchema }),
  sendVerificationEmailController,
);

authRouter.post(
  ROUTES.AUTH.VERIFY_EMAIL,
  authLimiter,
  validate({ body: confirmEmail }),
  verifyEmailController,
);

authRouter.get(
  ROUTES.AUTH.REFRESH_TOKEN,
  authLimiter,
  auth,
  refreshTokenController,
);

authRouter.post(
  ROUTES.AUTH.SEND_FORGOT_PASSWORD_OTP,
  authLimiter,
  validate({ body: sendforgotPassowrdOtpSchema }),
  sendForgotPasswordOTPController,
);

authRouter.post(
  ROUTES.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
  authLimiter,
  validate({ body: checkForgotPasswordOtpSchema }),
  checkForgotPasswordOTPController,
);

authRouter.patch(
  ROUTES.AUTH.RESET_PASSWORD,
  authLimiter,
  validate({ body: resetPasswordSchema }),
  resetPasswordController,
);

authRouter.patch(
  ROUTES.AUTH.CHANGE_PASSWORD,
  authLimiter,
  auth,
  validate({ body: changePasswordSchema }),
  changePasswordController,
);
