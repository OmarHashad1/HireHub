import { Router } from "express";
import { ROUTES } from "../../routes.js";
import {
  companyApplicationSchema,
  companyApplicationFileFieldsSchema,
  updateCompanyProfileSchema,
  getCompanyJobsSchema,
} from "../../schemas/company.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  changeCompanyLogoController,
  companyApplicationController,
  companyProfileController,
  deleteCompanyLogoController,
  getCompanyJobsController,
  getPublicCompanyController,
  updateCompanyProfileController,
} from "./company.controller.js";
import { uploadApplicationDoc, uploadAvatar } from "../../utils/multer.utils.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import {
  paginationQuerySchema,
  mutlerFileSchema,
} from "../../schemas/global.schema.js";
import { objectIdParamSchema } from "../../schemas/user.schema.js";

export const companyRouter: Router = Router();

companyRouter.post(
  ROUTES.COMPANY.COMPANY_APPLLICATION,
  auth,
  checkRole([ROLE.USER]),
  uploadApplicationDoc.fields([
    { name: "taxCard", maxCount: 1 },
    { name: "commercialRegistration", maxCount: 1 },
  ]),
  validate({
    body: companyApplicationSchema,
    files: companyApplicationFileFieldsSchema,
  }),
  companyApplicationController,
);

companyRouter.get(
  ROUTES.COMPANY.COMPANY_PROFILE,
  auth,
  checkRole([ROLE.COMPANY]),
  companyProfileController,
);

companyRouter.patch(
  ROUTES.COMPANY.COMPANY_PROFILE,
  auth,
  checkRole([ROLE.COMPANY]),
  validate({ body: updateCompanyProfileSchema }),
  updateCompanyProfileController,
);

companyRouter.patch(
  ROUTES.COMPANY.COMPANY_LOGO,
  auth,
  checkRole([ROLE.COMPANY]),
  uploadAvatar.single("logo"),
  validate({ file: mutlerFileSchema }),
  changeCompanyLogoController,
);

companyRouter.delete(
  ROUTES.COMPANY.COMPANY_LOGO,
  auth,
  checkRole([ROLE.COMPANY]),
  deleteCompanyLogoController,
);

companyRouter.get(
  ROUTES.COMPANY.COMPANY_JOBS,
  auth,
  checkRole([ROLE.ADMIN, ROLE.COMPANY]),
  validate({ params: getCompanyJobsSchema, query: paginationQuerySchema }),
  getCompanyJobsController,
);

companyRouter.get(
  ROUTES.COMPANY.PUBLIC_COMPANY,
  validate({ params: objectIdParamSchema }),
  getPublicCompanyController,
);
