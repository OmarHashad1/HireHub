import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { successRes } from "../../utils/response.util.js";
import { SignupDTO } from "../../schemas/auth.schema.js";
import { signup } from "./auth.service.js";

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await signup(req.body as SignupDTO);
    successRes({
      res,
      message: "Account created successfully",
      status: StatusCodes.CREATED,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
