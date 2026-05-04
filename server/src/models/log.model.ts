import { Schema, model } from "mongoose";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../enums/log.enums.js";
import { ILog } from "../types/logs.types.js";

const LogSchema = new Schema<ILog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [...Object.values(LOG_ACTION)],
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: [...Object.values(LOG_TARGET_TYPE)],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
  },
);

LogSchema.index({ actor: 1 });
LogSchema.index({ targetId: 1 });
LogSchema.index({ action: 1 });
LogSchema.index({ createdAt: -1 });

export const systemLogModel = model<ILog>("Log", LogSchema);
