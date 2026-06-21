import { reportModel } from "../models/report.model.js";
import { IReport } from "../types/report.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class ReportRepo extends DatabaseRepo<IReport> {
  constructor() {
    super(reportModel);
  }
}
