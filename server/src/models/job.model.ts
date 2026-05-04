import { Schema, model } from "mongoose";
import {
  JOB_STATUS,
  JOB_TYPE,
  EXPERIENCE_LEVEL,
  CURRENCY,
} from "../enums/job.enums.js";
import { IJob } from "../types/job.types.js";

const jobSchema = new Schema<IJob>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 5000,
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: [...Object.values(EXPERIENCE_LEVEL)],
    },
    type: {
      type: String,
      required: true,
      enum: [...Object.values(JOB_TYPE)],
    },
    location: {
      city: { type: String, default: null },
      country: { type: String, default: null },
      isRemote: { type: Boolean, default: false },
    },
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: {
        type: String,
        enum: [...Object.values(CURRENCY)],
        default: CURRENCY.EGP,
      },
    },
    status: {
      type: String,
      enum: [...Object.values(JOB_STATUS)],
      default: JOB_STATUS.DRAFT,
      index: true,
    },
    deadline: {
      type: Date,
      default: null,
    },

    applicantsCount: {
      type: Number,
      default: 0,
    },

    aiThreshold: {
      type: Number,
      min: 0,
      max: 100,
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

jobSchema.index({ title: "text" });
jobSchema.index({ company: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ type: 1 });

export const jobModel = model<IJob>("Job", jobSchema);
