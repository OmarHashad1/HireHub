import { NextFunction, Request, Response } from "express";
import { LOGOUT_TYPE } from "../../enums/user.enums.js";
import {
  addEducation,
  addExperience,
  changeAvatar,
  changeCv,
  changeEmail,
  deleteAccount,
  deleteAvatar,
  deleteCv,
  logout,
  profile,
  publicProfile,
  removeEducation,
  removeExperience,
  sendChangeEmailOTP,
  sendDeleteAccountOTP,
  updateEducation,
  updateExperience,
  updateProfile,
} from "./user.service.js";
import { errorRes, successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../../types/user.types.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../configs/cookie.config.js";
import {
  changeEmailDTO,
  deleteAccountDTO,
  educationDTO,
  experienceDTO,
  sendChangeEmailOtpDTO,
  updateEducationceDTO,
  updateExperienceDTO,
  updateProfileDTO,
} from "../../schemas/user.schema.js";
import { Types } from "mongoose";

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user)
      return errorRes({
        res,
        message: "Unauthorized",
        status: StatusCodes.UNAUTHORIZED,
      });
    const { type = LOGOUT_TYPE.DEVICE, FCM } = req.body;
    await logout({
      type,
      user: req.user,
      accessToken: req.cookies.accessToken,
      FCM,
    });
    successRes({
      res,
      message: "Logout successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const changeAvatarController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await changeAvatar({
      user: req.user as IUser,
      file: req.file as Express.Multer.File,
    });
    successRes({
      res,
      status: 200,
      message: "Avatar changed successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAvatarController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAvatar(req.user as IUser);
    successRes({
      res,
      message: "Avatar Deleted Successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const profileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await profile(req.user as IUser);
    successRes({
      res,
      message: "User Fetched Successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const publicProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await publicProfile(req.params.id as string);
    successRes({
      res,
      message: "User Fetched Successfully",
      status: StatusCodes.OK,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateProfile(req.user as IUser, req.body as updateProfileDTO);
    successRes({
      res,
      message: "User Profile Updated Successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const addExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await addExperience(req.user as IUser, req.body as experienceDTO);
    successRes({
      res,
      message: "Experience added successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};

export const removeExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await removeExperience(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Experience removed successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const addEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await addEducation(req.user as IUser, req.body as educationDTO);
    successRes({
      res,
      message: "Education added successfully",
      status: StatusCodes.CREATED,
    });
  } catch (err) {
    next(err);
  }
};

export const removeEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await removeEducation(req.user as IUser, req.params.id as string);
    successRes({
      res,
      message: "Education removed successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const sendChangeEmailOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sendChangeEmailOTP(
      req.user as IUser,
      req.body as sendChangeEmailOtpDTO,
    );
    successRes({
      res,
      message: "Verification code sent to your current email",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const changeEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await changeEmail(req.user as IUser, req.body as changeEmailDTO);
    successRes({
      res,
      message: "Email changed successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const changeCvController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await changeCv(req.user as IUser, req.file as Express.Multer.File);
    successRes({
      res,
      message: "CV changed successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCvController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteCv(req.user as IUser);
    successRes({
      res,
      message: "CV deleted successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const sendDeleteAccountOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sendDeleteAccountOTP(req.user as IUser);
    successRes({
      res,
      message: "Verification code sent to your email",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAccount(req.user as IUser, req.body as deleteAccountDTO);
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    successRes({
      res,
      message: "Account deleted successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const updateExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateExperience(
      req.user as IUser,
      req.params.id as string as unknown as Types.ObjectId,
      req.body as updateExperienceDTO,
    );
    successRes({
      res,
      message: "Experience updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
export const updateEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateEducation(
      req.user as IUser,
      req.params.id as string as unknown as Types.ObjectId,
      req.body as updateEducationceDTO,
    );
    successRes({
      res,
      message: "Education updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
