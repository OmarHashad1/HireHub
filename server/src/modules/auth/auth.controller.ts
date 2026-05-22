import { loginDTO } from "./../../schemas/auth.schema.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { errorRes, successRes } from "../../utils/response.util.js";
import { SignupDTO } from "../../schemas/auth.schema.js";
import { login, signup } from "./auth.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../configs/cookie.config.js";

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
  } catch (error: any) {
    if (error?.code == "11000") {
      return errorRes({
        res,
        message: "Phone Number already exists",
        status: StatusCodes.CONFLICT,
      });
    }
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken, refreshToken, firstName } = await login(
      req.body as loginDTO,
    );
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshTokken", refreshToken, refreshTokenCookieOptions);
    successRes({
      res,
      message: "Logged in successfully",
      status: StatusCodes.CREATED,
      data: { firstName },
    });
  } catch (err) {
    throw err;
  }
};
