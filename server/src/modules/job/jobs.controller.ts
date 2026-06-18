import { NextFunction, Request, Response } from "express";
import {
  createJob,
  getCompanyPublishedJobs,
  getPublishedJob,
  getPublishedJobs,
} from "./jobs.service.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../../types/user.types.js";
import { createJobDTO } from "../../schemas/job.schema.js";

export const getPublishedJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getPublishedJobs();
    successRes({
      res,
      message: "Data Fetched Successfully",
      data: payload,
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublishedJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getPublishedJob(req.params.id as string);
    successRes({
      res,
      message: "Data Fetched Successfully",
      data: payload,
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyPublishedJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getCompanyPublishedJobs(
      req.params.companyId as string,
    );
    successRes({
      res,
      message: "Data Fetched Successfully",
      data: payload,
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const createJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await createJob(req.user as IUser, req.body as createJobDTO);
    successRes({
      res,
      message: "Job created successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};

export const updateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (err) {
    next(err);
  }
};
