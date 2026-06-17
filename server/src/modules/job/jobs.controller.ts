import { NextFunction, Request, Response } from "express";
import { getPublishedJob, getPublishedJobs } from "./jobs.service.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";

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
