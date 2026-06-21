import { NextFunction, Request, Response } from "express";
import {
  deleteSavedJob,
  getAllSavedJobs,
  saveJob,
} from "./savedJobs.service.js";
import { IUser } from "../../types/user.types.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { paginationQueryDTO } from "../../schemas/global.schema.js";

export const saveJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await saveJob(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Job has been saved successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSavedJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteSavedJob(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Job deleted successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSavedJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getAllSavedJobs(
      req.user as IUser,
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "User saved jobs fetched successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};
