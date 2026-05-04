import { Document, Types } from "mongoose";

export interface IReport extends Document {
  reportedBy: Types.ObjectId;
  targetType: string;
  targetId: Types.ObjectId;
  reason: string;
  otherReason?: string | null;
  details?: string | null;
  status: string;
  resolvedBy?: Types.ObjectId | null;
  resolvedAt?: Date | null;
  resolutionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
