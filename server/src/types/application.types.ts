import { Document, Types } from "mongoose";
import { APPLICATION_STATUS } from "../enums/application.enums.js";

export interface IAiRating {
  score: number;
  summary: string;
  atsScore?: number | null;
  atsFeedback?: string | null;
  ratedAt: Date;
}

export interface IApplication extends Document {
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  cv: string;
  coverLetter?: string | null;
  status: APPLICATION_STATUS;
  rejectionReason?: string | null;
  recruiterNotes?: string | null;
  aiRating?: IAiRating | null;
  autoRejected: boolean;
  hadInterview: boolean;
  withdrawnAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
