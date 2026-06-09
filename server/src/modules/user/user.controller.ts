import { NextFunction, Request, Response } from "express";
import { LOGOUT_TYPE } from "../../enums/user.enums.js";
import { changeAvatar, deleteAvatar, logout } from "./user.service.js";
import { errorRes, successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../../types/user.types.js";

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

export const changeAvatarController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await changeAvatar({
      user: req.user as IUser,
      file: req.file as Express.Multer.File,
    });
    successRes({
      res,
      status: 200,
      message: "Avatar changed successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAvatarController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAvatar(req.user as IUser);
    successRes({
      res,
      message: "Avatar Deleted Successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
