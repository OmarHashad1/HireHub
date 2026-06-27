import { NextFunction, Request, Response } from "express";
import {
  changeCompanyLogo,
  companyApplication,
  companyProfile,
  deleteCompanyLogo,
  getCompanyJobs,
  getPublicCompany,
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

export const changeCompanyLogoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await changeCompanyLogo(
      req.user as IUser,
      req.file as Express.Multer.File,
    );
    successRes({
      res,
      message: "Company logo updated successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCompanyLogoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteCompanyLogo(req.user as IUser);
    successRes({
      res,
      message: "Company logo deleted successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await getPublicCompany(req.params.id as string);
    successRes({
      res,
      message: "Company Fetched Successfully",
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
