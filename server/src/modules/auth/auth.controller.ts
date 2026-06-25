import {
  checkForgotPasswordOtpDTO,
  confirmEmailDTO,
  loginDTO,
  resetPasswordDTO,
  sendforgotPassowrdOtpDTO,
} from "./../../schemas/auth.schema.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { successRes } from "../../utils/response.util.js";
import { SignupDTO } from "../../schemas/auth.schema.js";
import {
  changePassword,
  checkForgotPasswordOTP,
  googleLogin,
  login,
  refreshToken,
  resetPassword,
  sendForgotPasswordOTP,
  sendVerificationEmail,
  signup,
  verifyEmail,
} from "./auth.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../configs/cookie.config.js";
import { CLIENT_URL } from "../../configs/env.config.js";
import { IUser } from "../../types/user.types.js";

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
  } catch (err: any) {
    if (err?.code == 11000) {
      err.statusCode = StatusCodes.BAD_REQUEST;
    }
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
  if (!req.user) return res.redirect(`${CLIENT_URL}/login?error=oauth`);
  try {
    const { accessToken, refreshToken } = await googleLogin(
      req.user as unknown as {
        _id: string;
        email: string;
        role: string;
        firstName: string;
      },
    );
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.redirect(`${CLIENT_URL}/auth/google/callback`);
  } catch {
    res.redirect(`${CLIENT_URL}/login?error=oauth`);
  }
};

export const sendVerificationEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sendVerificationEmail(req.body);
    successRes({
      res,
      message: "Verification code sent successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await verifyEmail(req.body as confirmEmailDTO);
    successRes({
      res,
      message: "Email verified successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const sendForgotPasswordOTPController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sendForgotPasswordOTP(req.body as sendforgotPassowrdOtpDTO);
    successRes({
      res,
      message: "Password reset code sent successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const checkForgotPasswordOTPController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkForgotPasswordOTP(req.body as checkForgotPasswordOtpDTO);
    successRes({
      res,
      message: "OTP verified. You may now reset your password",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await resetPassword(req.body as resetPasswordDTO);
    successRes({
      res,
      message: "Password reset successfully",
      status: StatusCodes.OK,
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

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { newPassword, password } = req.body;
    await changePassword({ newPassword, password, user: req.user as IUser });
    successRes({ res, message: "Password changed successfully", status: 200 });
  } catch (err) {
    next(err);
  }
};
