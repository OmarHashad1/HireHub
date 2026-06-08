import { Router } from "express";
import { ROUTES } from "../../routes.js";
import { companyApplicationSchema } from "../../schemas/company.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { companyApplicationController } from "./user.controller.js";

export const companyRouter: Router = Router();

companyRouter.post(
  ROUTES.company.COMPANY_APLLICATION,
  validate({ body: companyApplicationSchema }),
  companyApplicationController,
);
