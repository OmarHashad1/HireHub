import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import {
  getSingleApplicationController,
  getUserApplicationsController,
  withdrawApplicationController,
} from "./application.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";

export const applicationRouter: Router = Router();

applicationRouter.get(
  ROUTES.APPLICATION.USER_APPLICATIONS,
  auth,
  checkRole([ROLE.ADMIN, ROLE.USER]),
  getUserApplicationsController,
);

applicationRouter.get(
  ROUTES.APPLICATION.APPLICATION_ITEM,
  auth,
  validate({ params: objectIdParamSchema }),
  checkRole([ROLE.ADMIN, ROLE.USER]),
  getSingleApplicationController,
);

applicationRouter.patch(
  ROUTES.APPLICATION.WITHDRAW_APPLICATION,
  auth,
  validate({ params: objectIdParamSchema }),
  checkRole([ROLE.USER]),
  withdrawApplicationController,
);
