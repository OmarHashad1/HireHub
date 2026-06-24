import { logModel } from "../models/log.model.js";
import { ILog } from "../types/logs.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class LogRepo extends DatabaseRepo<ILog> {
  constructor() {
    super(logModel);
  }
}
