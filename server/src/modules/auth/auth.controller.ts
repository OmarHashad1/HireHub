import { loginDTO } from "./../../schemas/auth.schema.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {  successRes } from "../../utils/response.util.js";
import { SignupDTO } from "../../schemas/auth.schema.js";
import { googleLogin, login, refreshToken, signup } from "./auth.service.js";
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
  } catch (err) {
    next(err);
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
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    successRes({
      res,
      message: "Logged in successfully",
      status: StatusCodes.CREATED,
      data: { firstName },
    });
  } catch (err) {
    next(err);
  }
};

export const googleCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new Error("OAuth authentication failed"));
  try {
    const { accessToken, refreshToken, firstName } = await googleLogin(
      req.user as unknown as {
        _id: string;
        email: string;
        role: string;
        firstName: string;
      },
    );
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    successRes({
      res,
      message: "Logged in successfully",
      status: StatusCodes.OK,
      data: { firstName },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = await refreshToken(req.cookies.refreshToken);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    successRes({ res, message: "Token refreshed", status: StatusCodes.OK });
  } catch (err) {
    next(err);
  }
};
