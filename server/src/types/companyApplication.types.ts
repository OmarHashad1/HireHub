import { Document, Types } from "mongoose";
import {
  COMPANY_APPLICATION_STATUS,
  INDUSTRY,
  COMPANY_SIZE,
} from "../enums/companyApplication.enums.js";

export interface ICompanyApplicationLocation {
  city: string;
  country: string;
}

export interface ICompanyApplicationDocuments {
  commercialRegistration: string;
  taxCard: string;
}

export interface ICompanyApplication extends Document {
  companyName: string;
  companyEmail: string;
  phone: string;
  website?: string | null;
  industry: INDUSTRY;
  linkedin?: string | null;
  size: COMPANY_SIZE;
  location: ICompanyApplicationLocation;
  description: string;
  documents: ICompanyApplicationDocuments;
  status: COMPANY_APPLICATION_STATUS;
  rejectionReason?: string | null;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
