import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  companyReportSchema,
  userReportSchema,
} from "../../schemas/report.schema.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import {
  reportCompanyController,
  reportUserController,
} from "./report.controller.js";

export const reportRouter: Router = Router();

reportRouter.post(
  ROUTES.REPORT.REPORT_COMPANY,
  auth,
  checkRole([ROLE.USER]),
  validate({
    body: companyReportSchema,
    params: objectIdParamSchema,
  }),
  reportCompanyController,
);

reportRouter.post(
  ROUTES.REPORT.REPORT_USER,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({
    body: userReportSchema,
    params: objectIdParamSchema,
  }),
  reportUserController,
);
