import { Document, Types } from "mongoose";
import { EDUCATION_LEVEL, ROLE } from "../enums/user.enums.js";

export interface IUserExperience {
  _id: Types.ObjectId;
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  description?: string | null;
}

export interface IUserEducation {
  _id: Types.ObjectId;
  level: EDUCATION_LEVEL;
  institution: string;
  field: string;
  from: Date;
  to: Date;
}

export interface IUserLocation {
  city?: string | null;
  country?: string | null;
}

export interface IUserSocialMedia {
  linkedin?: string | null;
  github?: string | null;
  leetcode?: string | null;
  portfolio?: string | null;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  googleId: string | null;
  provider: string;
  role: ROLE;
  avatar?: string | null;
  phoneNumber?: string | null;
  headline?: string | null;
  bio?: string | null;
  socialMedia?: IUserSocialMedia;
  location?: IUserLocation;
  cv?: string | null;
  skills: string[];
  experience: IUserExperience[];
  education: IUserEducation[];
  isEmailVerified: boolean;
  status: string;
  credentialsChangedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}
