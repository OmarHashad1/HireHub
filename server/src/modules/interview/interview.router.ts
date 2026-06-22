import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import {
  getCompanyInterviewsController,
  scheduleInterviewController,
} from "./interview.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { scheduleInterviewSchema } from "../../schemas/interview.schema.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import { paginationQuerySchema } from "../../schemas/global.schema.js";

export const interviewRouter: Router = Router();

interviewRouter.post(
  ROUTES.INTERVIEW.ROOT,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({
    body: scheduleInterviewSchema,
  }),
  scheduleInterviewController,
);

interviewRouter.get(
  ROUTES.INTERVIEW.COMPANY_INTERVIEW,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({ params: objectIdParamSchema, query: paginationQuerySchema }),
  getCompanyInterviewsController,
);
