import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import {
  getSingleApplicationController,
  getUserApplicationsController,
  updateApplicationController,
  withdrawApplicationController,
} from "./application.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import { paginationQuerySchema } from "../../schemas/global.schema.js";
import { updateApplicationSchema } from "../../schemas/application.schema.js";

export const applicationRouter: Router = Router();

applicationRouter.get(
  ROUTES.APPLICATION.USER_APPLICATIONS,
  auth,
  checkRole([ROLE.ADMIN, ROLE.USER]),
  validate({ query: paginationQuerySchema }),
  getUserApplicationsController,
);

applicationRouter.get(
  ROUTES.APPLICATION.APPLICATION_ITEM,
  auth,
  validate({ params: objectIdParamSchema }),
  getSingleApplicationController,
);

applicationRouter.patch(
  ROUTES.APPLICATION.WITHDRAW_APPLICATION,
  auth,
  validate({ params: objectIdParamSchema }),
  checkRole([ROLE.USER]),
  withdrawApplicationController,
);

applicationRouter.patch(
  ROUTES.APPLICATION.APPLICATION_ITEM,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({
    params: objectIdParamSchema,
    body:updateApplicationSchema
  }),
  updateApplicationController,
);
