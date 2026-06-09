import { HydratedDocument, Schema, model } from "mongoose";
import {
  COMPANY_APPLICATION_STATUS,
  INDUSTRY,
  COMPANY_SIZE,
} from "../enums/companyApplication.enums.js";
import { ICompanyApplication } from "../types/companyApplication.types.js";
import { sendMail } from "../utils/smtp.util.js";
import { decrypt } from "../utils/encryption.util.js";

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
      maxLength: 100,
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

companyApplicationSchema.pre(
  "save",
  function (this: HydratedDocument<ICompanyApplication> & { newDoc: boolean }) {
    if (this.isNew) {
      this.newDoc = true;
    }
  },
);

companyApplicationSchema.post(
  "save",
  async function (
    this: HydratedDocument<ICompanyApplication> & { newDoc: boolean },
  ) {
    if (this.newDoc) {
      await sendMail({
        to: this.companyEmail,
        subject: "Application Received!",
        html: "<h1>Application Received</h1>",
      });
    }
  },
);

companyApplicationSchema.post(
  ["find", "findOne"],
  function (
    this: any,
    docs:
      | HydratedDocument<ICompanyApplication>[]
      | HydratedDocument<ICompanyApplication>,
  ) {
    if (this.op == "find") {
      (docs as HydratedDocument<ICompanyApplication>[]).map(
        (doc: ICompanyApplication) => {
          if (doc.phone) doc.phone = decrypt(doc.phone as string);
        },
      );
    } else {
      const doc = docs as HydratedDocument<ICompanyApplication> | null;
      if (doc && doc.phone) {
        doc.phone = decrypt(doc?.phone as string);
      }
    }
  },
);
export const companyApplicationModel = model<ICompanyApplication>(
  "CompanyApplication",
  companyApplicationSchema,
);
