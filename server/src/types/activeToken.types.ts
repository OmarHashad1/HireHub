import { Document, Types } from "mongoose";

export interface IActiveToken extends Document {
  jti: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
