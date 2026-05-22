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
  decodeTokenParams,
  generateTokenParams,
  verifyTokenParams,
} from "../types/global.types.js";
import {
  InternalServerErrorException,
  UnauthorizedException,
} from "./errorHandler.util.js";
import { UserRepo } from "../repositories/user.repo.js";
import { TokenRepo } from "../repositories/token.repo.js";

import { nanoid } from "nanoid";

const userRepo = new UserRepo();
const tokenRepo = new TokenRepo();
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
  options,
  type = "access",
}: generateTokenParams) => {
  try {
    const secretKey = token_secrets[role][type];
    if (!secretKey) throw new Error("Invalid token or user type");
    return jwt.sign(payload, secretKey, options);
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

export const decodeToken = async ({
  token,
  type = "access",
}: decodeTokenParams) => {
  try {
    const { role } = jwt.decode(token) as { role: keyof typeof token_secrets };

    const jwtPayload = verifyToken({ role, type, token }) as unknown as {
      _id: string;
      jti: string;
      email: string;
      iat: number;
      role: keyof typeof token_secrets;
    };

    const user = await userRepo.findOne({
      filter: {
        _id: jwtPayload._id,
      },
      options: {
        lean: true,
      },
    });
    return {
      user,
      jti: jwtPayload.jti,
      iat: jwtPayload.iat,
    };
  } catch (err) {
    throw err;
  }
};

export const generateTokens = async ({
  id,
  email,
  role,
}: {
  id: string;
  email: string;
  role: keyof typeof token_secrets;
}) => {
  const jti = nanoid(25);

  const accessToken = generateToken({
    role,
    payload: {
      _id: id ,
      email: email,
      role: role,
    },
    options: {
      jwtid: jti,
      expiresIn: "1S",
    },
  });

  const refreshToken = generateToken({
    role: role,
    type: "refresh",
    payload: {
      _id: id ,
      email: email,
      role: role,
    },
    options: {
      jwtid: jti,
      expiresIn: "1W",
    },
  });
  await tokenRepo.create({
    data: {
      jti,
      userId: id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  });

  return { refreshToken, accessToken };
};
