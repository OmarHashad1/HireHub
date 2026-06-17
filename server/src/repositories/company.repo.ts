import { companyModel } from "../models/company.model.js";
import { ICompany } from "../types/company.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class CompanyRepo extends DatabaseRepo<ICompany> {
  constructor() {
    super(companyModel);
  }
}
