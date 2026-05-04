import { Document, Types } from "mongoose";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../enums/log.enums.js";

export interface ILog extends Document {
  actor: Types.ObjectId;
  action: LOG_ACTION;
  targetType: LOG_TARGET_TYPE;
  targetId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
