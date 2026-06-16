import { jobModel } from "../models/job.model.js";
import { IJob } from "../types/job.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class JobRepo extends DatabaseRepo<IJob> {
  constructor() {
    super(jobModel);
  }
}
