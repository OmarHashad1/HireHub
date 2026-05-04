import { Schema, model } from "mongoose";
import {
  COMPANY_APPLICATION_STATUS,
  INDUSTRY,
  COMPANY_SIZE,
} from "../enums/companyApplication.enums.js";
import { ICompanyApplication } from "../types/companyApplication.types.js";

const companyApplicationSchema = new Schema<ICompanyApplication>(
  {
    companyName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      required: true,
      enum: [...Object.values(INDUSTRY)],
    },
    size: {
      type: String,
      required: true,
      enum: [...Object.values(COMPANY_SIZE)],
      default: COMPANY_SIZE.SMALL,
    },
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    description: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    documents: {
      commercialRegistration: {
        type: String,
        required: true,
      },
      taxCard: {
        type: String,
        required: true,
      },
    },
    linkedin: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [...Object.values(COMPANY_APPLICATION_STATUS)],
      default: COMPANY_APPLICATION_STATUS.PENDING,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
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

export const companyApplicationModel = model<ICompanyApplication>(
  "CompanyApplication",
  companyApplicationSchema,
);
