import { Schema, model } from "mongoose";
import {
  REPORT_STATUS,
  REPORT_TARGET_TYPE,
  REPORT_REASON,
} from "../enums/report.enums.js";
import { IReport } from "../types/report.types.js";

const reportSchema = new Schema<IReport>(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: [...Object.values(REPORT_TARGET_TYPE)],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    reason: {
      type: String,
      enum: [...Object.values(REPORT_REASON)],
      required: true,
    },
    otherReason: {
      type: String,
      minLength: 10,
      maxLength: 100,
      required: function (this: IReport) {
        return this.reason == REPORT_REASON.OTHER;
      },
    },
    details: {
      type: String,
      maxlength: 500,
      default: null,
    },
    status: {
      type: String,
      enum: [...Object.values(REPORT_STATUS)],
      default: REPORT_STATUS.PENDING,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    timestamps: true,
    strictQuery: true,
    strict: true,
    optimisticConcurrency: true,
  },
);
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ targetId: 1 });
reportSchema.index({ status: 1 });

export const reportModel = model<IReport>("Report", reportSchema);
