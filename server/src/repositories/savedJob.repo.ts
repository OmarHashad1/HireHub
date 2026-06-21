import { savedJobModel } from "../models/savedJob.model.js";
import { ISavedJob } from "../types/savedJob.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class SavedJobRepo extends DatabaseRepo<ISavedJob> {
  constructor() {
    super(savedJobModel);
  }
}
