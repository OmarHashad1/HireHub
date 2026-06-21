import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import {
  deleteSavedJobController,
  getAllSavedJobsController,
  saveJobController,
} from "./savedJobs.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import { paginationQuerySchema } from "../../schemas/global.schema.js";

export const savedJobRouter: Router = Router();

savedJobRouter.post(
  ROUTES.SAVED_JOB.SAVE_ITEM,
  auth,
  checkRole([ROLE.USER]),
  validate({ params: objectIdParamSchema }),
  saveJobController,
);

savedJobRouter.delete(
  ROUTES.SAVED_JOB.SAVE_ITEM,
  auth,
  checkRole([ROLE.USER]),
  validate({ params: objectIdParamSchema }),
  deleteSavedJobController,
);

savedJobRouter.get(
  "/",
  auth,
  checkRole([ROLE.USER]),
  validate({ query: paginationQuerySchema }),
  getAllSavedJobsController,
);
