import jwt from "jsonwebtoken";
import { ROLE } from "../enums/user.enums.js";
import {
  ADMIN_ACCESS_SECRET,
  ADMIN_REFRESH_SECRET,
  RECRUITER_ACCESS_SECRET,
  RECRUITER_REFRESH_SECRET,
  USER_ACCESS_SECRET,
  USER_REFRESH_SECRET,
} from "../configs/env.config.js";
import {
  generateTokenParams,
  verifyTokenParams,
} from "../types/global.types.js";
import {
  InternalServerErrorException,
  UnauthorizedException,
} from "./errorHandler.util.js";

export const token_secrets = {
  user: {
    access: USER_ACCESS_SECRET,
    refresh: USER_REFRESH_SECRET,
  },
  recruiter: {
    access: RECRUITER_ACCESS_SECRET,
    refresh: RECRUITER_REFRESH_SECRET,
  },
  admin: {
    access: ADMIN_ACCESS_SECRET,
    refresh: ADMIN_REFRESH_SECRET,
  },
};

export const generateToken = ({
  payload,
  role,
  options ,
  type = "access",
}: generateTokenParams) => {
  try {
    const secretKey = token_secrets[role][type];
    if (!secretKey) throw new Error("Invalid token or user type");
    return jwt.sign(payload, secretKey,options);
  } catch (err) {
    throw new InternalServerErrorException("Failed to generate token", {
      cause: err,
    });
  }
};

export const verifyToken = ({
  role = ROLE.USER,
  type = "access",
  token,
}: verifyTokenParams) => {
  try {
    const secretKey = token_secrets[role][type];
    if (!secretKey) throw new Error("Invalid token or user type");
    return jwt.verify(token, secretKey);
  } catch (err: any) {
    throw new UnauthorizedException("Invalid or expired token", { cause: err });
  }
};
