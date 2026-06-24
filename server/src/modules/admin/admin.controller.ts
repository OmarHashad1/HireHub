import { NextFunction, Request, Response } from "express";
import {
  getAllUsers,
  getUser,
  updateCompanyApplicationStatus,
  updateUserStatus,
} from "./admin.service.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../../types/user.types.js";
import { updateCompanyApplicationStatusDTO } from "../../schemas/company.schema.js";
import { updateUserStatusDTO } from "../../schemas/admin.schema.js";

export const updateCompanyApplicationStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateCompanyApplicationStatus(
      req.user as IUser,
      req.body as updateCompanyApplicationStatusDTO,
    );
    successRes({
      res,
      message: "Application status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllUsers(req.query as unknown as paginationQueryDTO);
    successRes({
      res,
      message: "Users data fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getUser(req.params.id as string);
    successRes({
      res,
      message: "User data fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateUserStatus(
      req.user as IUser,
      req.body as updateUserStatusDTO,
      req.params.id as string,
    );
    successRes({
      res,
      message: "User status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
