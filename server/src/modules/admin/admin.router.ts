import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  getAllApplicationsController,
  getAllCompaniesController,
  getAllCompanyApplicationsController,
  getAllJobsController,
  getAllReportsController,
  getAllUsersController,
  getApplicationController,
  getCompanyController,
  getCompanyApplicationController,
  getJobController,
  getLogsController,
  getReportController,
  getStatsController,
  getUserController,
  updateCompanyApplicationStatusController,
  updateCompanyStatusController,
  updateJobStatusController,
  updateReportStatusController,
  updateUserStatusController,
} from "./admin.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateCompanyApplicationStatusSchema } from "../../schemas/company.schema.js";
import { paginationQuerySchema } from "../../schemas/global.schema.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";
import {
  updateCompanyStatusSchema,
  updateJobStatusSchema,
  updateReportStatusSchema,
  updateUserStatusSchema,
} from "../../schemas/admin.schema.js";

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

adminRouter.get(
  ROUTES.ADMIN.LIST_COMPANY_APPLICATIONS,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getAllCompanyApplicationsController,
);

adminRouter.get(
  ROUTES.ADMIN.COMPANY_APPLICATION_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ params: objectIdParamSchema }),
  getCompanyApplicationController,
);

adminRouter.get(
  ROUTES.ADMIN.LIST_COMPANIES,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getAllCompaniesController,
);

adminRouter.get(
  ROUTES.ADMIN.COMPANY_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ params: objectIdParamSchema }),
  getCompanyController,
);

adminRouter.patch(
  ROUTES.ADMIN.COMPANY_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ body: updateCompanyStatusSchema, params: objectIdParamSchema }),
  updateCompanyStatusController,
);

adminRouter.get(
  ROUTES.ADMIN.LIST_JOBS,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getAllJobsController,
);

adminRouter.get(
  ROUTES.ADMIN.JOB_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ params: objectIdParamSchema }),
  getJobController,
);

adminRouter.patch(
  ROUTES.ADMIN.JOB_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ body: updateJobStatusSchema, params: objectIdParamSchema }),
  updateJobStatusController,
);

adminRouter.get(
  ROUTES.ADMIN.LIST_APPLICATIONS,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getAllApplicationsController,
);

adminRouter.get(
  ROUTES.ADMIN.APPLICATION_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ params: objectIdParamSchema }),
  getApplicationController,
);

adminRouter.get(
  ROUTES.ADMIN.LIST_REPORTS,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getAllReportsController,
);

adminRouter.get(
  ROUTES.ADMIN.REPORT_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ params: objectIdParamSchema }),
  getReportController,
);

adminRouter.patch(
  ROUTES.ADMIN.REPORT_ITEM,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ body: updateReportStatusSchema, params: objectIdParamSchema }),
  updateReportStatusController,
);

adminRouter.get(
  ROUTES.ADMIN.LIST_LOGS,
  auth,
  checkRole([ROLE.ADMIN]),
  validate({ query: paginationQuerySchema }),
  getLogsController,
);

adminRouter.get(
  ROUTES.ADMIN.STATS,
  auth,
  checkRole([ROLE.ADMIN]),
  getStatsController,
);
