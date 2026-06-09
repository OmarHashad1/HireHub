import { StatusCodes } from "http-status-codes";
import { successRes } from "../utils/response.util.js";
import { getAsset } from "../utils/s3.util.js";
import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/errorHandler.util.js";
import { APPLICATION_NAME } from "../configs/env.config.js";

export const requestFileMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const { path } = req.params as { path: string[] };
    if (!path || path[0] != APPLICATION_NAME) {
      throw new BadRequestException("Invalid path");
    }
    if (path.includes("avatar")) {
      if (req.user._id.toString() != path[2]) {
        throw new UnauthorizedException();
      }
    }
    const Key = path.join("/");

    if (Key != req.user.avatar) {
      throw new BadRequestException("Invalid Key");
    }
    const requestedFile = await getAsset({ Key });
    return successRes({
      res,
      message: "Signed URL fetched Successfully",
      status: StatusCodes.OK,
      data: { requestedFile },
    });
  } catch (err) {
    next(err);
  }
};
