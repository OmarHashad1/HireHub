import { NextFunction, Request, Response } from "express";
import { scheduleInterview } from "./interview.service.js";
import { IUser } from "../../types/user.types.js";
import { scheduleInterviewDTO } from "../../schemas/interview.schema.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";

export const scheduleInterviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await scheduleInterview(
      req.user as IUser,
      req.body as scheduleInterviewDTO,
    );
    successRes({
      res,
      message: "Interview scheduled successfully",
      status: StatusCodes.CREATED,
      data,
    });
  } catch (err) {
    next(err);
  }
};
