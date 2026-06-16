import { Router } from "express";
import { ROUTES } from "../../routes.js";
import {
  companyApplicationSchema,
  companyApplicationFileFieldsSchema,
} from "../../schemas/company.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { companyApplicationController } from "./company.controller.js";
import { uploadApplicationDoc } from "../../utils/multer.utils.js";

export const companyRouter: Router = Router();

companyRouter.post(
  ROUTES.COMPANY.COMPANY_APLLICATION,
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
