import { NextFunction, Request, Response } from "express";
import { LOGOUT_TYPE } from "../../enums/user.enums.js";
import { logout } from "./user.service.js";
import { errorRes, successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user)
      return errorRes({
        res,
        message: "Unauthorized",
        status: StatusCodes.UNAUTHORIZED,
      });
    const { type = LOGOUT_TYPE.DEVICE } = req.body;
    await logout({
      type,
      user: req.user,
      accessToken: req.cookies.accessToken,
    });
    successRes({
      res,
      message: "Logout successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
