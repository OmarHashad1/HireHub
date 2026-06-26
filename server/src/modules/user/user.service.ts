import { LOGOUT_TYPE, PROVIDER } from "../../enums/user.enums.js";
import { IUser } from "../../types/user.types.js";
import { decodeToken } from "../../utils/token.util.js";
import { redisService } from "../../DB/RedisService.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { deleteAsset, uploadAsset } from "../../utils/s3.util.js";
import { multerStorageType } from "../../enums/multer.enums.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenExceptions,
  NotFoundException,
  TooManyRequestsException,
  UnauthorizedException,
} from "../../utils/errorHandler.util.js";
import { calculateAge } from "../../utils/age.util.js";
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
import { generateOTP } from "../../utils/generateOTP.util.js";
import * as argon2 from "argon2";
import { emailEmitter, EMAIL_EVENTS } from "../../events/email.events.js";
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { FlattenMaps, HydratedDocument, Types, UpdateQuery } from "mongoose";
const userRepo = new UserRepo();

export const logout = async ({
  type,
  user,
  accessToken,
  FCM,
}: {
  type: LOGOUT_TYPE;
  user: IUser;
  accessToken: string;
  FCM?: string;
}) => {
  switch (type) {
    case LOGOUT_TYPE.DEVICE: {
      const { jti, iat } = await decodeToken({
        token: accessToken,
        type: "access",
      });
      await redisService.set({
        key: redisService.revokedTokenKey({
          jti,
          userId: user._id as unknown as string,
        }),
        value: jti,
        ttl: iat + 7 * 24 * 60 * 60 - Math.floor(Date.now() / 1000),
      });
      if (FCM) {
        await redisService.removeFCM(user._id as Types.ObjectId, FCM);
      }
      break;
    }
    case LOGOUT_TYPE.ALL: {
      await userRepo.updateOne({
        filter: {
          _id: user._id,
        },
        update: {
          credentialsChangedAt: new Date(),
        },
      });
      await redisService.removeFCMUser(user._id as Types.ObjectId);
      break;
    }
    default: {
      throw new Error("Invalid Logout Type");
    }
  }

  activityLogger.info({
    event: "user.logout",
    actor: user._id,
    email: user.email,
    logoutType: type,
    action: LOG_ACTION.LOGOUT,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });
};

export const changeAvatar = async ({
  user,
  file,
}: {
  user: IUser;
  file: Express.Multer.File;
}) => {
  if (user.avatar) {
    await deleteAsset({ Key: user.avatar });
  }
  const bucketKey = await uploadAsset({
    path: `users/${user._id}`,
    file,
    storageStrategy: multerStorageType.DESK,
  });

  await userRepo.updateOne({
    filter: {
      _id: user._id,
    },
    update: {
      avatar: bucketKey,
    },
  });

  activityLogger.info({
    event: "user.avatar.changed",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.CHANGE_AVATAR,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });
};

export const deleteAvatar = async (user: IUser) => {
  if (!user.avatar) {
    throw new BadRequestException("No User Avatar found to delete");
  }
  await deleteAsset({ Key: user.avatar as string });
  await userRepo.updateOne({
    filter: { _id: user._id },
    update: { $unset: { avatar: 1 } },
  });

  activityLogger.info({
    event: "user.avatar.deleted",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.DELETE_AVATAR,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });
};

export const profile = async (user: IUser) => {
  const {
    _id,
    email,
    firstName,
    lastName,
    age,
    avatar,
    role,
    phoneNumber,
    socialMedia,
    bio,
    headline,
    cv,
    skills,
  } = user;

  return {
    _id,
    email,
    firstName,
    lastName,
    age,
    avatar,
    role,
    phoneNumber,
    socialMedia,
    bio,
    headline,
    cv,
    skills,
  };
};

export const publicProfile = async (id: string) => {
  const user = await userRepo.findOne({
    filter: { _id: id },
    projection: {
      firstName: 1,
      lastName: 1,
      avatar: 1,
      role: 1,
      headline: 1,
      bio: 1,
      socialMedia: 1,
      skills: 1,
      experience: 1,
      education: 1,
    },
    options: { lean: true },
  });

  if (!user) throw new NotFoundException("User not found");

  return user;
};

export const updateProfile = async (
  user: IUser,
  updateSchema: updateProfileDTO,
) => {
  const { socialMedia, DOB, ...rest } = updateSchema;
  const update: UpdateQuery<IUser> = { ...rest };

  if (socialMedia) {
    for (const [key, value] of Object.entries(socialMedia)) {
      update[`socialMedia.${key}`] = value;
    }
  }

  if (DOB) {
    update.DOB = DOB;
    update.age = calculateAge(DOB);
  }

  const result = await userRepo.updateOne({
    filter: { _id: user._id },
    update,
  });

  activityLogger.info({
    event: "user.profile.updated",
    actor: user._id,
    email: user.email,
    fields: Object.keys(updateSchema),
    action: LOG_ACTION.UPDATE_PROFILE,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return result;
};

export const addExperience = async (user: IUser, experience: experienceDTO) => {
  const result = await userRepo.updateOne({
    filter: { _id: user._id },
    update: { $push: { experience } },
  });

  activityLogger.info({
    event: "user.experience.added",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.ADD_EXPERIENCE,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return result;
};

export const removeExperience = async (user: IUser, experienceId: string) => {
  const result = await userRepo.updateOne({
    filter: { _id: user._id, "experience._id": experienceId },
    update: { $pull: { experience: { _id: experienceId } } },
  });
  if (result.matchedCount === 0)
    throw new NotFoundException("Experience not found");

  activityLogger.info({
    event: "user.experience.removed",
    actor: user._id,
    email: user.email,
    experienceId,
    action: LOG_ACTION.REMOVE_EXPERIENCE,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return result;
};

export const addEducation = async (user: IUser, education: educationDTO) => {
  const result = await userRepo.updateOne({
    filter: { _id: user._id },
    update: { $push: { education } },
  });

  activityLogger.info({
    event: "user.education.added",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.ADD_EDUCATION,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return result;
};

export const removeEducation = async (user: IUser, educationId: string) => {
  const result = await userRepo.updateOne({
    filter: { _id: user._id, "education._id": educationId },
    update: { $pull: { education: { _id: educationId } } },
  });
  if (result.matchedCount === 0)
    throw new NotFoundException("Education not found");

  activityLogger.info({
    event: "user.education.removed",
    actor: user._id,
    email: user.email,
    educationId,
    action: LOG_ACTION.REMOVE_EDUCATION,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return result;
};

export const sendChangeEmailOTP = async (
  user: IUser,
  { email }: sendChangeEmailOtpDTO,
) => {
  if (user.provider == PROVIDER.GOOGLE) {
    throw new ForbiddenExceptions("Google Account can't change their emails");
  }
  if (email === user.email)
    throw new ForbiddenExceptions(
      "New email can't be the same as the current email",
    );

  const isEmailExist = await userRepo.findOne({
    filter: { email },
    options: { lean: true },
  });
  if (isEmailExist) throw new BadRequestException("Email already used");

  const otpKey = redisService.otpKey({
    userId: user._id,
    subject: "change-email",
  });

  const blockTTL = await redisService.getTTL(
    redisService.otpKeyBlock({ userId: user._id, subject: "change-email" }),
  );
  if (blockTTL > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTTL / 60)} minutes`,
    );

  const currentOtpTtl = await redisService.getTTL(otpKey);
  if (currentOtpTtl > 0)
    throw new TooManyRequestsException(
      `Please wait ${Math.ceil(currentOtpTtl / 60)} minutes before requesting a new code`,
    );

  const otp = generateOTP();

  const hashedOTP = await argon2.hash(otp);

  await redisService.set({
    key: otpKey,
    value: { hashedOTP, attempts: 0 },
    ttl: 2 * 60,
  });

  emailEmitter.emit(EMAIL_EVENTS.CHANGE_EMAIL, { to: user.email, otp });

  activityLogger.info({
    event: "user.change-email.otp-sent",
    actor: user._id,
    email: user.email,
    newEmail: email,
    action: LOG_ACTION.SEND_CHANGE_EMAIL_OTP,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });
};

export const changeEmail = async (
  user: IUser,
  { email, otp }: changeEmailDTO,
) => {
  if (user.provider == PROVIDER.GOOGLE) {
    throw new ForbiddenExceptions("Google Account can't change their emails");
  }
  const userId = user._id as Types.ObjectId;
  const otpKey = redisService.otpKey({
    userId,
    subject: "change-email",
  });
  const blockKey = redisService.otpKeyBlock({
    userId,
    subject: "change-email",
  });
  const blockTTL = await redisService.getTTL(blockKey);

  if (blockTTL > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTTL / 60)} minutes`,
    );

  const otpRaw = (await redisService.get(otpKey)) as string | null;
  if (!otpRaw)
    throw new BadRequestException("Code has expired. Please request a new one");

  const { hashedOTP, attempts } = JSON.parse(otpRaw) as {
    hashedOTP: string;
    attempts: number;
  };

  if (!(await argon2.verify(hashedOTP, otp))) {
    const newAttempts = attempts + 1;
    if (newAttempts >= 5) {
      await Promise.all([
        redisService.set({ key: blockKey, value: 1, ttl: 7 * 60 }),
        redisService.del(otpKey),
      ]);

      throw new TooManyRequestsException(
        "Too many failed attempts. Please request a new code",
      );
    }
    const remainingTtl = await redisService.getTTL(otpKey);
    await redisService.set({
      key: otpKey,
      value: { hashedOTP, attempts: newAttempts },
      ttl: remainingTtl,
    });
    throw new UnauthorizedException("Invalid verification code", {
      data: { remainingAttempts: 5 - newAttempts },
    });
  }
  const emailTaken = await userRepo.findOne({
    filter: { email },
    options: { lean: true },
  });
  if (emailTaken) throw new ConflictException("Email already used");

  await userRepo.updateOne({
    filter: { _id: user._id },
    update: {
      email,
      credentialsChangedAt: new Date(),
    },
  });

  await redisService.del(otpKey);

  activityLogger.info({
    event: "user.email.changed",
    actor: userId,
    email,
    previousEmail: user.email,
    action: LOG_ACTION.CHANGE_EMAIL,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: userId,
  });
};

export const changeCv = async (user: IUser, file: Express.Multer.File) => {
  if (user.cv) {
    await deleteAsset({ Key: user.cv });
  }
  const bucketKey = await uploadAsset({
    path: `users/${user._id}`,
    file,
    storageStrategy: multerStorageType.DESK,
  });
  const result = await userRepo.updateOne({
    filter: {
      _id: user._id,
    },
    update: {
      cv: bucketKey,
    },
  });

  activityLogger.info({
    event: "user.cv.changed",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.CHANGE_CV,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return result;
};

export const deleteCv = async (user: IUser) => {
  if (!user.cv) {
    throw new BadRequestException("No CV found to delete");
  }
  await deleteAsset({ Key: user.cv });
  await userRepo.updateOne({
    filter: { _id: user._id },
    update: { $unset: { cv: 1 } },
  });

  activityLogger.info({
    event: "user.cv.deleted",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.DELETE_CV,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });
};

export const sendDeleteAccountOTP = async (user: IUser) => {
  const otpKey = redisService.otpKey({
    userId: user._id,
    subject: "delete-account",
  });

  const blockTTL = await redisService.getTTL(
    redisService.otpKeyBlock({ userId: user._id, subject: "delete-account" }),
  );
  if (blockTTL > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTTL / 60)} minutes`,
    );

  const currentOtpTtl = await redisService.getTTL(otpKey);
  if (currentOtpTtl > 0)
    throw new TooManyRequestsException(
      `Please wait ${Math.ceil(currentOtpTtl / 60)} minutes before requesting a new code`,
    );

  const otp = generateOTP();

  const hashedOTP = await argon2.hash(otp);

  await redisService.set({
    key: otpKey,
    value: { hashedOTP, attempts: 0 },
    ttl: 2 * 60,
  });

  emailEmitter.emit(EMAIL_EVENTS.DELETE_ACCOUNT, { to: user.email, otp });

  activityLogger.info({
    event: "user.delete-account.otp-sent",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.SEND_DELETE_ACCOUNT_OTP,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });
};

export const deleteAccount = async (user: IUser, { otp }: deleteAccountDTO) => {
  const userId = user._id as Types.ObjectId;
  const otpKey = redisService.otpKey({ userId, subject: "delete-account" });
  const blockKey = redisService.otpKeyBlock({
    userId,
    subject: "delete-account",
  });

  const blockTTL = await redisService.getTTL(blockKey);
  if (blockTTL > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTTL / 60)} minutes`,
    );

  const otpRaw = (await redisService.get(otpKey)) as string | null;
  if (!otpRaw)
    throw new BadRequestException("Code has expired. Please request a new one");

  const { hashedOTP, attempts } = JSON.parse(otpRaw) as {
    hashedOTP: string;
    attempts: number;
  };

  if (!(await argon2.verify(hashedOTP, otp))) {
    const newAttempts = attempts + 1;
    if (newAttempts >= 5) {
      await Promise.all([
        redisService.set({ key: blockKey, value: 1, ttl: 7 * 60 }),
        redisService.del(otpKey),
      ]);

      throw new TooManyRequestsException(
        "Too many failed attempts. Please request a new code",
      );
    }
    const remainingTtl = await redisService.getTTL(otpKey);
    await redisService.set({
      key: otpKey,
      value: { hashedOTP, attempts: newAttempts },
      ttl: remainingTtl,
    });
    throw new UnauthorizedException("Invalid verification code", {
      data: { remainingAttempts: 5 - newAttempts },
    });
  }

  if (user.avatar) await deleteAsset({ Key: user.avatar });
  if (user.cv) await deleteAsset({ Key: user.cv });

  await userRepo.deleteOne({ filter: { _id: userId } });

  await Promise.all([
    redisService.del(otpKey),
    redisService.removeFCMUser(userId),
  ]);

  activityLogger.info({
    event: "user.account.deleted",
    actor: userId,
    email: user.email,
    action: LOG_ACTION.DELETE_ACCOUNT,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: userId,
  });
};

export const updateExperience = async (
  user: IUser,
  experienctId: Types.ObjectId,
  experienceDTO: updateExperienceDTO,
) => {
  const doc: HydratedDocument<IUser> | FlattenMaps<IUser> | null =
    await userRepo.findOne({
      filter: {
        experience: {
          $elemMatch: {
            _id: experienctId as unknown as Types.ObjectId,
          },
        },
        deletedAt: { $exists: false },
        _id: user._id,
      },
      projection: { experience: 1 },
      options: { lean: true },
    });
  if (!doc) throw new NotFoundException("Experience not found");
  const experience = doc.experience.filter((exp) => exp._id == experienctId)[0];
  const updateExperience = { ...experience, ...experienceDTO };

  return await userRepo.updateOne({
    filter: {
      _id: user._id,
      experience: {
        $elemMatch: {
          _id: experienctId as unknown as Types.ObjectId,
        },
      },
    },
    update: {
      $set: { "experience.$": updateExperience },
    },
  });
};

export const updateEducation = async (
  user: IUser,
  educationId: Types.ObjectId,
  educationDTO: updateEducationceDTO,
) => {
  const doc: HydratedDocument<IUser> | FlattenMaps<IUser> | null =
    await userRepo.findOne({
      filter: {
        education: {
          $elemMatch: {
            _id: educationId as unknown as Types.ObjectId,
          },
        },
        deletedAt: { $exists: false },
        _id: user._id,
      },
      projection: { education: 1 },
      options: { lean: true },
    });
  if (!doc) throw new NotFoundException("education not found");
  const education = doc.education.filter((edu) => edu._id == educationId)[0];
  const updateEducation = { ...education, ...educationDTO };
  return await userRepo.updateOne({
    filter: {
      _id: user._id,
      education: {
        $elemMatch: {
          _id: educationId as unknown as Types.ObjectId,
        },
      },
    },
    update: {
      $set: { "education.$": updateEducation },
    },
  });
};
