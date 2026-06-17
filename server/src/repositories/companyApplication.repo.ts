import { companyApplicationModel } from "../models/companyApplication.model.js";
import { ICompanyApplication } from "../types/companyApplication.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class CompanyApplicationRepo extends DatabaseRepo<ICompanyApplication> {
  static updateOne(arg0: { _id: any; }, arg1: { status: any; reviewedBy: any; reviewedAt: Date; }) {
    throw new Error("Method not implemented.");
  }
  constructor() {
    super(companyApplicationModel);
  }
}
