import { Schema, model } from "mongoose";
import { APPLICATION_STATUS } from "../enums/application.enums.js";
import { IApplication } from "../types/application.types.js";

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cv: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    status: {
      type: String,
      enum: [...Object.values(APPLICATION_STATUS)],
      default: APPLICATION_STATUS.APPLIED,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    recruiterNotes: {
      type: String,
      default: null,
    },

    aiRating: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    autoRejected: {
      type: Boolean,
      default: false,
    },
    aiNotes: {
      type: String,
      default: null,
    },

    hadInterview: {
      type: Boolean,
      default: false,
    },
    withdrawnAt: {
      type: Date,
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

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });

export const applicationModel = model<IApplication>(
  "Application",
  applicationSchema,
);
