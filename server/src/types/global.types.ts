import { Response, Request } from "express";
import { token_secrets } from "../utils/token.util.js";
import { SignOptions } from "jsonwebtoken";
import { IUser } from "./user.types.js";
import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { multerStorageType } from "../enums/multer.enums.js";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export interface emailDTO {
  to: string;
  subject: string;
  html: string;
}

export interface successResponseDTO<T> {
  res: Response;
  message: string;
  status: number;
  data?: T;
}

export interface errorResponseDTO<T> {
  res: Response;
  message: string;
  status: number;
  error?: T;
}

export interface generateTokenParams {
  type?: "access" | "refresh";
  payload: {
    _id: string;
    email: string;
    role: keyof typeof token_secrets;
  };
  options?: SignOptions | undefined;
}

export interface verifyTokenParams {
  role: keyof typeof token_secrets;
  type: "access" | "refresh";
  token: string;
}

export interface decodeTokenParams {
  type: "access" | "refresh";
  token: string;
}

export interface uploadOpts {
  maxSizeMB: number;
  allowedMimTypes: String[];
  buildFileName: (req: Request, file: Express.Multer.File) => string;
}

export interface IS3UploadAsset {
  storageStrategy?: multerStorageType;
  Bucket?: string;
  Key?: string;
  file: Express.Multer.File;
  path: string;
  ACL?: ObjectCannedACL;
  contentType?: string | undefined;
}

export interface IS3UploadAsset {
  storageStrategy?: multerStorageType;
  Bucket?: string;
  file: Express.Multer.File;
  path: string;
  ACL?: ObjectCannedACL;
  contentType?: string | undefined;
}
