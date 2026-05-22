import { Schema, model } from "mongoose";
import {
  EDUCATION_LEVEL,
  PROVIDER,
  ROLE,
  USER_STATUS,
} from "../enums/user.enums.js";
import { IUser } from "../types/user.types.js";

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: function (this: IUser) {
        return this.provider === PROVIDER.SYSTEM;
      },
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === PROVIDER.SYSTEM;
      },
      default: null,
    },
    googleId: {
      type: String,
      required: function (this: IUser) {
        return this.provider === PROVIDER.GOOGLE;
      },
      default: null,
    },
    role: {
      type: String,
      default: ROLE.USER,
      enum: [...Object.values(ROLE)],
    },
    avatar: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    provider: {
      type: String,
      default: PROVIDER.SYSTEM,
      enum: [...Object.values(PROVIDER)],
    },
    socialMedia: {
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      leetcode: { type: String, default: null },
      portfolio: { type: String, default: null },
    },
    headline: {
      type: String,
      maxLength: 100,
      default: null,
    },
    bio: {
      type: String,
      maxLength: 500,
      default: null,
    },
    location: {
      city: { type: String, default: null },
      country: { type: String, default: null },
    },
    cv: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        current: { type: Boolean, default: false },
        description: { type: String, default: null },
      },
    ],
    education: [
      {
        level: {
          type: String,
          enum: [...Object.values(EDUCATION_LEVEL)],
          default: EDUCATION_LEVEL.BACHELOR,
          required: true,
        },
        institution: { type: String, required: true },
        field: { type: String, required: true },
        from: { type: Date, required: true },
        to: { type: Date, required: true },
      },
    ],

    status: {
      type: String,
      enum: [...Object.values(USER_STATUS)],
      default: USER_STATUS.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    credentialsChangedAt: {
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

userSchema
  .virtual("fullName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (value) {
    const fullName = value.split(" ");
    this.firstName = fullName[0];
    this.lastName = fullName[1];
  });

export const userModel = model<IUser>("User", userSchema);
