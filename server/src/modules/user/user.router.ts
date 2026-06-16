import { Router } from "express";
import { ROUTES } from "../../routes.js";
import {
  addEducationController,
  addExperienceController,
  changeAvatarController,
  changeCvController,
  changeEmailController,
  deleteAccountController,
  deleteAvatarController,
  deleteCvController,
  logoutController,
  profileController,
  publicProfileController,
  removeEducationController,
  removeExperienceController,
  sendChangeEmailOtpController,
  sendDeleteAccountOtpController,
  updateEducationController,
  updateExperienceController,
  updateProfileController,
} from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { changeRole } from "../../middlewares/checkRole.middleware.js";
import { ROLE } from "../../enums/user.enums.js";
import { uploadAvatar, uploadCV } from "../../utils/multer.utils.js";
import { mutlerFileSchema } from "../../schemas/global.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  changeEmailSchema,
  deleteAccountSchema,
  educationSchema,
  experienceSchema,
  objectIdParamSchema,
  sendChangeEmailOtpSchema,
  updateEducationSchema,
  updateExperienceSchema,
  updateProfileSchema,
} from "../../schemas/user.schema.js";

export const userRouter: Router = Router();

userRouter.get(ROUTES.USER.PROFILE, auth, profileController);

userRouter.get(
  ROUTES.USER.PUBLIC_PROFILE,
  auth,
  validate({ params: objectIdParamSchema }),
  publicProfileController,
);

userRouter.post(ROUTES.USER.LOGOUT, auth, logoutController);

userRouter.patch(
  ROUTES.USER.CHANGE_AVATAR,
  auth,
  uploadAvatar.single("avatar"),
  validate({ file: mutlerFileSchema }),
  changeAvatarController,
);

userRouter.delete(ROUTES.USER.DELETE_AVATAR, auth, deleteAvatarController);

userRouter.patch(
  ROUTES.USER.UPDATE_PROFILE,
  auth,
  changeRole([ROLE.USER]),
  validate({ body: updateProfileSchema }),
  updateProfileController,
);

userRouter.post(
  ROUTES.USER.EXPERIENCE,
  auth,
  changeRole([ROLE.USER]),
  validate({ body: experienceSchema }),
  addExperienceController,
);

userRouter.delete(
  ROUTES.USER.EXPERIENCE_ITEM,
  auth,
  changeRole([ROLE.USER]),
  validate({ params: objectIdParamSchema }),
  removeExperienceController,
);

userRouter.post(
  ROUTES.USER.EDUCATION,
  auth,
  changeRole([ROLE.USER]),
  validate({ body: educationSchema }),
  addEducationController,
);

userRouter.delete(
  ROUTES.USER.EDUCATION_ITEM,
  auth,
  changeRole([ROLE.USER]),
  validate({ params: objectIdParamSchema }),
  removeEducationController,
);

userRouter.post(
  ROUTES.USER.SEND_CHANGE_EMAIL_OTP,
  auth,
  validate({ body: sendChangeEmailOtpSchema }),
  sendChangeEmailOtpController,
);

userRouter.patch(
  ROUTES.USER.CHANGE_EMAIL,
  auth,
  validate({ body: changeEmailSchema }),
  changeEmailController,
);

userRouter.patch(
  ROUTES.USER.CHANGE_CV,
  auth,
  changeRole([ROLE.USER]),
  uploadCV.single("cv"),
  validate({ file: mutlerFileSchema }),
  changeCvController,
);

userRouter.delete(
  ROUTES.USER.DELETE_CV,
  auth,
  changeRole([ROLE.USER]),
  deleteCvController,
);

userRouter.post(
  ROUTES.USER.SEND_DELETE_ACCOUNT_OTP,
  auth,
  sendDeleteAccountOtpController,
);

userRouter.delete(
  ROUTES.USER.DELETE_ACCOUNT,
  auth,
  validate({ body: deleteAccountSchema }),
  deleteAccountController,
);

userRouter.patch(
  ROUTES.USER.EXPERIENCE_ITEM,
  auth,
  changeRole([ROLE.USER]),
  validate({ body: updateExperienceSchema, params: objectIdParamSchema }),
  updateExperienceController,
);

userRouter.patch(
  ROUTES.USER.EDUCATION_ITEM,
  auth,
  changeRole([ROLE.USER]),
  validate({ body: updateEducationSchema, params: objectIdParamSchema }),
  updateEducationController,
);
