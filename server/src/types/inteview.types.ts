import { Document, Types } from "mongoose";
import { INTERVIEW_TYPE, INTERVIEW_STATUS } from "../enums/interview.enums.js";

export interface IInterview extends Document {
  application: Types.ObjectId;
  job: Types.ObjectId;
  company: Types.ObjectId;
  applicant: Types.ObjectId;
  type: INTERVIEW_TYPE;
  scheduledAt: Date;
  status: INTERVIEW_STATUS;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
