import { Response } from "express";
import { token_secrets } from "../utils/token.util.js";
import { SignOptions } from "jsonwebtoken";

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
  role: keyof typeof token_secrets;
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
