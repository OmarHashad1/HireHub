import { HydratedDocument, Schema, model } from "mongoose";
import {
  EDUCATION_LEVEL,
  PROVIDER,
  ROLE,
  USER_STATUS,
} from "../enums/user.enums.js";
import { IUser } from "../types/user.types.js";
import argon2 from "argon2";
import { decrypt, encrypt } from "../utils/encryption.util.js";
import { sendMail } from "../utils/smtp.util.js";
export const userSchema = new Schema<IUser>(
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
    oldPasswords: {
      type: [String],
      default: [],
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
      sparse: true,
      required: function (this: IUser) {
        return this.provider === PROVIDER.SYSTEM;
      },
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
    deletedAt: {
      type: Date,
    },
    restoredAt: {
      type: Date,
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

userSchema.pre(
  "save",
  async function (this: HydratedDocument<IUser> & { newDocument: boolean }) {
    this.newDocument = this.isNew;

    if (this.isDirectModified("password")) {
      this.password = await argon2.hash(this.password as string);
    }
    if (this.isDirectModified("phoneNumber")) {
      this.phoneNumber = encrypt(this.phoneNumber as string);
    }
  },
);

userSchema.post(
  "save",
  async function (this: HydratedDocument<IUser> & { newDocument: boolean }) {
    if (this.newDocument) {
      await sendMail({
        to: this.email,
        subject: "Welcome",
        html: `<h2> Welcome to HireHub ${this.firstName}! </h1>`,
      });
    }
  },
);

userSchema.pre(["findOne", "find"], function () {
  const query = this.getFilter();
  if (query.paranoId) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});

userSchema.post(
  ["findOne", "find"],
  function (
    this: any,
    docs: HydratedDocument<IUser>[] | HydratedDocument<IUser> | null,
  ) {
    if (this.op == "find") {
      (docs as HydratedDocument<IUser>[]).forEach(
        (doc: HydratedDocument<IUser>) => {
          if (doc.phoneNumber)
            doc.phoneNumber = decrypt(doc.phoneNumber as string);
        },
      );
    } else {
      const doc = docs as HydratedDocument<IUser> | null;
      if (doc && doc.phoneNumber)
        doc.phoneNumber = decrypt(doc?.phoneNumber as string);
    }
  },
);
export const userModel = model<IUser>("User", userSchema);
