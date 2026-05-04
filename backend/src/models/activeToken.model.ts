import { Schema, model } from "mongoose";
import { IActiveToken } from "../types/activeToken.types.js";

const activeTokenSchema = new Schema<IActiveToken>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strictQuery: true,
    strict: true,
  },
);

activeTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const activeTokenModel = model<IActiveToken>(
  "ActiveToken",
  activeTokenSchema,
);
