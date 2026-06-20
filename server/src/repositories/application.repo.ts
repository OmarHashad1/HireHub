import { applicationModel } from "../models/application.model.js";
import { IApplication } from "../types/application.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class ApplicationRepo extends DatabaseRepo<IApplication> {
  constructor() {
    super(applicationModel);
  }
}
