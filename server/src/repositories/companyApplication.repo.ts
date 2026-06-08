import { companyApplicationModel } from "../models/companyApplication.model.js";
import { ICompanyApplication } from "../types/companyApplication.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class CompanyApplicationRepo extends DatabaseRepo<ICompanyApplication> {
  constructor() {
    super(companyApplicationModel);
  }
}
