import { Document, Types } from "mongoose";
import { LOG_ACTION, LOG_LEVEL, LOG_TARGET_TYPE } from "../enums/log.enums.js";

export interface ILog extends Document {
  level:       LOG_LEVEL;
  message?:    string | null;
  actor?:      Types.ObjectId | null;
  action?:     LOG_ACTION | null;
  targetType?: LOG_TARGET_TYPE | null;
  targetId?:   Types.ObjectId | null;
  createdAt:   Date;
}