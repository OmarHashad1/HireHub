import { updateJobDTO } from "./../../schemas/job.schema.js";
import { NextFunction, Request, Response } from "express";
import {
  closeJob,
  createJob,
  deleteJob,
  getCompanyPublishedJobs,
  getPublishedJob,
  getPublishedJobs,
  publishJob,
  updateJob,
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
    await updateJob(
      req.user as IUser,
      req.params.id as string,
      req.body as updateJobDTO,
    );
    successRes({
      res,
      message: "Job updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const publishJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await publishJob(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Job published successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const closeJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await closeJob(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Job closed successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteJob(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Job Deleted Successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
