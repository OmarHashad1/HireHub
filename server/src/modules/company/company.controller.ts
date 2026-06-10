import { NextFunction, Request, Response } from "express";
import { companyApplication } from "./company.service.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { ICompanyApplication } from "../../types/companyApplication.types.js";

export const companyApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await companyApplication(
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
    if (err?.code == "11000") {
      err.statusCode = StatusCodes.CONFLICT;
      err.message = "Email already registerd";
    }
    next(err);
  }
};
