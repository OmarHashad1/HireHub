import { Document, Types } from "mongoose";
import { COMPANY_BENEFIT, COMPANY_STATUS } from "../enums/company.enums.js";
import { INDUSTRY, COMPANY_SIZE } from "../enums/companyApplication.enums.js";

export interface ICompanyLocation {
  city: string;
  country: string;
}

export interface ICompanyDocuments {
  commercialRegistration: string;
  taxCard: string;
}

export interface ICompanySocialMedia {
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}

export interface ICompany extends Document {
  owner: Types.ObjectId;
  companyApplication: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  industry: INDUSTRY;
  size: COMPANY_SIZE;
  location: ICompanyLocation;
  description: string;
  logo: string;
  documents: ICompanyDocuments;
  coverImage?: string | null;
  foundedAt?: Date | null;
  website?: string | null;
  benefits: COMPANY_BENEFIT[];
  socialMedia?: ICompanySocialMedia;
  status: COMPANY_STATUS;
  suspend_reason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
