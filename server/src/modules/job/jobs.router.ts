import { updateJobSchema } from "./../../schemas/job.schema.js";
import { Router } from "express";
import { ROUTES } from "../../routes.js";
import {
  closeJobController,
  createJobController,
  deleteJobController,
  getCompanyPublishedJobsController,
  getPublishedJobController,
  getPublishedJobsController,
  publishJobController,
  updateJobController,
} from "./jobs.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { createJobSchema } from "../../schemas/job.schema.js";
import { uploadCV } from "../../utils/multer.utils.js";
import { createApplicationSchema } from "../../schemas/application.schema.js";
import {
  mutlerFileSchema,
  paginationQuerySchema,
} from "../../schemas/global.schema.js";
import { createApplicationController } from "../application/application.controller.js";

export const jobRouter: Router = Router();

jobRouter.get(
  ROUTES.JOB.JOBS,
  validate({ query: paginationQuerySchema }),
  getPublishedJobsController,
);

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
    query: paginationQuerySchema,
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
    body: updateJobSchema,
    params: objectIdParamSchema,
  }),
  updateJobController,
);

jobRouter.patch(
  ROUTES.JOB.JOB_PUBLISH,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({ params: objectIdParamSchema }),
  publishJobController,
);

jobRouter.patch(
  ROUTES.JOB.JOB_CLOSE,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({ params: objectIdParamSchema }),
  closeJobController,
);

jobRouter.delete(
  ROUTES.JOB.JOB_ITEM,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({
    params: objectIdParamSchema,
  }),
  deleteJobController,
);

jobRouter.post(
  ROUTES.JOB.JOB_APPLICATION,
  auth,
  checkRole([ROLE.USER]),
  uploadCV.single("cv"),
  validate({
    params: objectIdParamSchema,
    body: createApplicationSchema,
    file: mutlerFileSchema.optional(),
  }),
  createApplicationController
);

