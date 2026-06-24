import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  getAllUsersController,
  getUserController,
  updateCompanyApplicationStatusController,
  updateUserStatusController,
} from "./admin.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateCompanyApplicationStatusSchema } from "../../schemas/company.schema.js";
import { paginationQuerySchema } from "../../schemas/global.schema.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import { updateUserStatusSchema } from "../../schemas/admin.schema.js";

export const adminRouter: Router = Router();

adminRouter.patch(
  ROUTES.COMPANY.COMPANY_APPLLICATION,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ body: updateCompanyApplicationStatusSchema }),
  updateCompanyApplicationStatusController,
);

adminRouter.get(
  ROUTES.ADMIN.LIST_USERS,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getAllUsersController,
);

adminRouter.get(
  ROUTES.ADMIN.USER,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ params: objectIdParamSchema }),
  getUserController,
);

adminRouter.patch(
  ROUTES.ADMIN.USER,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ body: updateUserStatusSchema, params: objectIdParamSchema }),
  updateUserStatusController,
);
