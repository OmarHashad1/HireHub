import { StatusCodes } from "http-status-codes";
import { successRes } from "../utils/response.util.js";
import { getAsset } from "../utils/s3.util.js";
import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/errorHandler.util.js";
import { APPLICATION_NAME } from "../configs/env.config.js";
import { ROLE } from "../enums/user.enums.js";

export const requestFileMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required to access files");
    }
    const { path } = req.params as { path: string[] };
    if (!path || path[0] != APPLICATION_NAME) {
      throw new BadRequestException("Invalid file path");
    }
    let ownedKey: string | null | undefined;

    if (path.includes("avatar")) {
      if (req.user._id.toString() != path[2]) {
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );
      }
      ownedKey = req.user.avatar;
    } else if (path.includes("cv")) {
      if (req.user._id.toString() != path[2]) {
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );
      }
      ownedKey = req.user.cv;
    } else if (
      path.includes("commercialRegistration") ||
      path.includes("taxCard")
    ) {
      if (req.user._id.toString() != path[2]) {
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );
      }
      if (req.user.role == ROLE.USER)
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );
    } else {
      throw new BadRequestException("Unsupported file type requested");
    }

    const Key = path.join("/");

    if (Key != ownedKey) {
      throw new BadRequestException("Requested file not found");
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
