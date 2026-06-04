import { model, Schema } from "mongoose";
import { LOG_ACTION, LOG_LEVEL, LOG_TARGET_TYPE } from "../enums/log.enums.js";
import { ILog } from "../types/logs.types.js";

const logSchema = new Schema<ILog>(
  {
    level: {
      type: Number,
      enum: [
        ...Object.values(LOG_LEVEL).filter((log) => typeof log == "number"),
      ],
      required: true,
    },
    message: {
      type: String,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      enum: [...Object.values(LOG_ACTION)],
      required: true,
    },
    targetType: {
      type: String,
      enum: [...Object.values(LOG_TARGET_TYPE)],
      default: null,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      refPath: "targetType",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strictQuery: true,
    strict: true,
  },
);

logSchema.index({ actor: 1 });
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const logModel = model<ILog>("Log", logSchema);
