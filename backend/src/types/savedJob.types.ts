import { Document, Types } from "mongoose";

export interface ISavedJob extends Document {
  user: Types.ObjectId;
  job: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
