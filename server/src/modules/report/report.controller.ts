import { NextFunction, Request, Response } from "express";
import {
  getCompanyReports,
  getUserReports,
  reportCompany,
  reportUser,
} from "./report.service.js";
import { IUser } from "../../types/user.types.js";
import {
  companyReportDTO,
  userReportDTO,
} from "../../schemas/report.schema.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";

export const reportCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await reportCompany(
      req.user as IUser,
      req.params.id as string,
      req.body as companyReportDTO,
    );
    successRes({
      res,
      message: "Report submitted successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getCompanyReports(
      req.user as IUser,
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "Company reports fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getUserReports(
      req.user as IUser,
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "User reports fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const reportUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await reportUser(
      req.user as IUser,
      req.params.id as string,
      req.body as userReportDTO,
    );
    successRes({
      res,
      message: "Report submitted successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};
