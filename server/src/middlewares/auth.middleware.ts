import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/token.util.js";
import { errorRes } from "../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { TokenRepo } from "../repositories/token.repo.js";
import { USER_STATUS } from "../enums/user.enums.js";

const tokenRepo = new TokenRepo();

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, jti, iat } = await decodeToken({
      token: req.cookies.accessToken,
      type: "access",
    });

    if (!user) {
      return errorRes({
        res,
        message: "user not found",
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    const isTokenActive = tokenRepo.findOne({
      filter: {
        userId: user?._id,
        jti,
      },
      options: {
        lean: true,
      },
    });
    if (!isTokenActive) {
      return errorRes({
        res,
        message: "Invalid session. Please login again",
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    if (
      user.status == USER_STATUS.BANNED ||
      user.status == USER_STATUS.DEACTIVAED
    ) {
      return errorRes({
        res,
        message: "Your account has been suspended. Please contact support.",
        status: StatusCodes.FORBIDDEN,
      });
    }

    if (iat < (user.credentialsChangedAt as Date).getTime() / 1000) {
      return errorRes({
        res,
        message: "Invalid session. Please login again",
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    next();
  } catch (err: any) {
    errorRes({ res, message: err.message, status: 401 });
  }
};
