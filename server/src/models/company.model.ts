import { Schema, model } from "mongoose";
import { COMPANY_BENEFIT, COMPANY_STATUS } from "../enums/company.enums.js";
import { INDUSTRY, COMPANY_SIZE } from "../enums/companyApplication.enums.js";
import { ICompany } from "../types/company.types.js";

const companySchema = new Schema<ICompany>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyApplication: {
      type: Schema.Types.ObjectId,
      ref: "CompanyApplication",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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
    description: { type: String, required: true },
    logo: { type: String, default: null },
    documents: {
      commercialRegistration: { type: String, required: true },
      taxCard: { type: String, required: true },
    },
    coverImage: { type: String, default: null },
    foundedAt: { type: Date, default: null },
    website: { type: String, default: null },
    benefits: {
      type: [String],
      enum: [...Object.values(COMPANY_BENEFIT)],
      default: [],
    },
    socialMedia: {
      twitter: { type: String, default: null },
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      linkedin: { type: String, default: null },
    },
    status: {
      type: String,
      enum: [...Object.values(COMPANY_STATUS)],
      default: COMPANY_STATUS.ACTIVE,
    },
    suspendReason: {
      type: String,
      required: function (this: ICompany) {
        return this.status === COMPANY_STATUS.SUSPENDED;
      },
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


export const companyModel = model<ICompany>("Company", companySchema);
