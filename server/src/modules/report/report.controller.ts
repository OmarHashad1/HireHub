import { NextFunction, Request, Response } from "express";
import { reportCompany, reportUser } from "./report.service.js";
import { IUser } from "../../types/user.types.js";
import {
  companyReportDTO,
  userReportDTO,
} from "../../schemas/report.schema.js";
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
