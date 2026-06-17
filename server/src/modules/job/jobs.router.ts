import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { getPublishedJobsController } from "./jobs.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";

export const jobRouter: Router = Router();

jobRouter.get(ROUTES.JOB.JOB, getPublishedJobsController);

jobRouter.get(
  ROUTES.JOB.JOB_ITEM,
  validate({ params: objectIdParamSchema }),
  getPublishedJobsController,
);
