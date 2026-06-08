import { NextFunction, Request, Response } from "express";
import { companyApplication } from "./user.service.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";

export const companyApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await companyApplication(req.body);
    successRes({
      res,
      message: "Company Application Created Successfully!",
      status: StatusCodes.CREATED,
      data: {
        companyName: payload.companyName,
      },
    });
  } catch (err: any) {
    console.log(1);
    if (err?.code == "11000") {
      err.statusCode = StatusCodes.CONFLICT;
      err.message = "Email already registerd";
    }
    next(err);
  }
};
