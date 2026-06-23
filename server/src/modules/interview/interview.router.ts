import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import {
  getCompanyInterviewsController,
  getUserInterviewsController,
  scheduleInterviewController,
  updateScheduledInterviewController,
} from "./interview.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  scheduleInterviewSchema,
  updateScheduledInterviewSchema,
} from "../../schemas/interview.schema.js";
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
  ROUTES.INTERVIEW.USER_INTERVIEWS,
  auth,
  checkRole([ROLE.USER]),
  validate({ query: paginationQuerySchema }),
  getUserInterviewsController,
);

interviewRouter.get(
  ROUTES.INTERVIEW.COMPANY_INTERVIEW,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({ params: objectIdParamSchema, query: paginationQuerySchema }),
  getCompanyInterviewsController,
);

interviewRouter.patch(
  ROUTES.INTERVIEW.INTERVIEW_ITEM,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({
    body: updateScheduledInterviewSchema,
    params: objectIdParamSchema,
  }),
  updateScheduledInterviewController
);
