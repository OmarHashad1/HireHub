import { Response, Request } from "express";
import { token_secrets } from "../utils/token.util.js";
import { SignOptions } from "jsonwebtoken";
import { IUser } from "./user.types.js";

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
