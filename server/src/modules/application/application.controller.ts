import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import {
  createApplication,
  getSingleApplication,
  getUserApplications,
  withdrawApplication,
} from "./application.service.js";
import { IUser } from "../../types/user.types.js";
import { successRes } from "../../utils/response.util.js";
import { createApplicationDTO } from "../../schemas/application.schema.js";

export const getUserApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getUserApplications(req.user as IUser);
    successRes({
      res,
      message: "User applications fetched successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getSingleApplication(
      req.user as IUser,
      req.params.id as string,
    );
    successRes({
      res,
      message: "Application fetched successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const withdrawApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await withdrawApplication(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Application has been withdrawn successfully",
      status: StatusCodes.ACCEPTED,
    });
  } catch (err) {
    next(err);
  }
};

export const createApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await createApplication(
      req.user as IUser,
      req.params.id as string,
      req.body as createApplicationDTO,
      req.file,
    );
    successRes({
      res,
      message: "Application Created successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};
