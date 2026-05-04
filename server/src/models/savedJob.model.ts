import { Schema, model } from "mongoose";
import { ISavedJob } from "../types/savedJob.types.js";

const savedJobSchema = new Schema<ISavedJob>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
  },
);

savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export const savedJobModel = model<ISavedJob>("SavedJob", savedJobSchema);
