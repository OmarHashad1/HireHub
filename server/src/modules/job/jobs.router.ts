import { Router } from "express";
import { ROUTES } from "../../routes.js";
import {
  createJobController,
  getCompanyPublishedJobsController,
  getPublishedJobController,
  getPublishedJobsController,
  updateJobController,
} from "./jobs.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { createJobSchema } from "../../schemas/job.schema.js";

export const jobRouter: Router = Router();

jobRouter.get(ROUTES.JOB.JOBS, getPublishedJobsController);

jobRouter.get(
  ROUTES.JOB.JOB_ITEM,
  validate({ params: objectIdParamSchema }),
  getPublishedJobController,
);

jobRouter.get(
  ROUTES.JOB.COMPANY_JOBS,
  validate({
    params: objectIdParamSchema
      .extend({ companyId: objectIdParamSchema.shape.id })
      .omit({ id: true }),
  }),
  getCompanyPublishedJobsController,
);

jobRouter.post(
  ROUTES.JOB.JOBS,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({ body: createJobSchema }),
  createJobController,
);

jobRouter.patch(
  ROUTES.JOB.JOB_ITEM,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({
    params: objectIdParamSchema
      .extend({ jobId: objectIdParamSchema.shape.id })
      .omit({ id: true }),
  }),
  updateJobController,
);
