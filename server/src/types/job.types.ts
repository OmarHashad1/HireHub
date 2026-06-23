import { Document, Types } from "mongoose";
import {
  JOB_STATUS,
  JOB_TYPE,
  EXPERIENCE_LEVEL,
  CURRENCY,
} from "../enums/job.enums.js";

export interface IJobLocation {
  isRemote: boolean;
  city?: string | null;
  country?: string | null;
}

export interface IJobSalary {
  min?: number | null;
  max?: number | null;
  currency: CURRENCY;
}

export interface IJob extends Document {
  company: Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: EXPERIENCE_LEVEL;
  type: JOB_TYPE;
  location: IJobLocation;
  salary: IJobSalary;
  deadline?: Date | null;
  applicantsCount: number;
  aiThreshold?: number | null;
  autoReject: boolean;
  status: JOB_STATUS;
  createdAt: Date;
  updatedAt: Date;
}
