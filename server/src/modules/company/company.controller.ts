import { NextFunction, Request, Response } from "express";
import {
  companyApplication,
  companyProfile,
  getCompanyJobs,
  updateCompanyProfile,
} from "./company.service.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { ICompanyApplication } from "../../types/companyApplication.types.js";
import { IUser } from "../../types/user.types.js";
import {
  getCompanyJobsDTO,
  updateCompanyProfileDTO,
} from "../../schemas/company.schema.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";

export const companyApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await companyApplication(
      req.user as IUser,
      req.body as ICompanyApplication,
      req.files as Record<string, Express.Multer.File[]>,
    );
    successRes({
      res,
      message: "Company Application Created Successfully!",
      status: StatusCodes.CREATED,
      data: {
        companyName: payload.companyName,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const companyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await companyProfile(req.user as IUser);
    successRes({
      res,
      message: "Company Profile Fetched Successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCompanyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateCompanyProfile(
      req.user as IUser,
      req.body as updateCompanyProfileDTO,
    );
    successRes({
      res,
      message: "Company profile updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};


export const getCompanyJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getCompanyJobs(
      req.user as IUser,
      req.params as getCompanyJobsDTO,
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "company jobs fetched successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};
