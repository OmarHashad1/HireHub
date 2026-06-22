import { Schema, model } from "mongoose";
import { INTERVIEW_TYPE, INTERVIEW_STATUS } from "../enums/interview.enums.js";
import { IInterview } from "../types/inteview.types.js";

const interviewSchema = new Schema<IInterview>(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
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
    type: {
      type: String,
      enum: [...Object.values(INTERVIEW_TYPE)],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [...Object.values(INTERVIEW_STATUS)],
      default: INTERVIEW_STATUS.SCHEDULED,
      index: true,
    },
    cancelledAt: {
      type: Date,
      required: function (this: IInterview) {
        return this.status == INTERVIEW_STATUS.CANCELLED;
      },
      default: null,
    },
    cancellationReason: {
      type: String,
      required: function (this: IInterview) {
        return this.status == INTERVIEW_STATUS.CANCELLED;
      },
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

interviewSchema.index({ application: 1 });
interviewSchema.index({ applicant: 1 });
interviewSchema.index({ company: 1 });
interviewSchema.index({ scheduledAt: 1 });

export const interviewModel = model<IInterview>("Interview", interviewSchema);
