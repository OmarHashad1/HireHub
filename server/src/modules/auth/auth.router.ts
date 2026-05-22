import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { ROUTES } from "../../routes.js";
import { loginController, signupController } from "./auth.controller.js";
import { loginSchema, signupSchema } from "../../schemas/auth.schema.js";

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
