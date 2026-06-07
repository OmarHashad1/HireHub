import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/token.util.js";
import { errorRes } from "../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { USER_STATUS } from "../enums/user.enums.js";
import { IUser } from "../types/user.types.js";
import { redisService } from "../DB/RedisService.js";
import { AppError } from "../utils/errorHandler.util.js";


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

    if (
      await redisService.exists(
        redisService.revokedTokenKey({ jti, userId: user._id }),
      )
    ) {
      return errorRes({
        res,
        message: "Invalid session. Please login again",
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    if (user.credentialsChangedAt) {
      if (iat < (user.credentialsChangedAt as Date).getTime() / 1000) {
        return errorRes({
          res,
          message: "Invalid session. Please login again",
          status: StatusCodes.UNAUTHORIZED,
        });
      }
    }

    req.user = user as unknown as IUser;

    next();
  } catch (err: any) {
    errorRes({
      res,
      message: err.message,
      status:
        err instanceof AppError
          ? err.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR,
      error: err instanceof AppError ? err.data : undefined,
    });
  }
};
