import { changePasswordDTO } from "./../../schemas/auth.schema.js";
import argon2 from "argon2";
import { PROVIDER, ROLE, USER_STATUS } from "../../enums/user.enums.js";
import { UserRepo } from "../../repositories/user.repo.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenExceptions,
  InternalServerErrorException,
  NotFoundException,
  TooManyRequestsException,
  UnauthorizedException,
} from "../../utils/errorHandler.util.js";
import { activityLogger, serverLogger } from "../../utils/logger.util.js";
import {
  checkForgotPasswordOtpDTO,
  confirmEmailDTO,
  loginDTO,
  resetPasswordDTO,
  sendforgotPassowrdOtpDTO,
  sendVerifyEmailDTO,
  SignupDTO,
} from "../../schemas/auth.schema.js";
import {
  decodeToken,
  generateToken,
  generateTokens,
  token_secrets,
} from "../../utils/token.util.js";
import { redisService } from "../../DB/RedisService.js";
import { generateOTP } from "../../utils/generateOTP.util.js";
import { sendMail } from "../../utils/smtp.util.js";
import { Types } from "mongoose";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";

const userRepo = new UserRepo();

export const signup = async (dto: SignupDTO) => {
  const existing = await userRepo.findOne({
    filter: { email: dto.email },
    projection: { _id: 1 },
    options: { lean: true },
  });

  if (existing) throw new ConflictException("Email is already in use");

  const user = await userRepo.create({
    data: { ...dto, role: ROLE.USER },
  });

  activityLogger.info({
    event: "user.signup",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.CREATE_USER,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: user._id,
  });

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
};

export const login = async (dto: loginDTO) => {
  const user = await userRepo.findOne({
    filter: { email: dto.email },
    projection: {
      _id: 1,
      role: 1,
      password: 1,
      email: 1,
      firstName: 1,
    },
    options: { lean: true },
  });
  if (
    !user ||
    !user.password ||
    !(await argon2.verify(user.password, dto.password))
  ) {
    activityLogger.warn({ event: "user.login.failed", email: dto.email });
    throw new UnauthorizedException("Email or password is not correct");
  }
  if (!user.role) {
    serverLogger.error({
      event: "user.login.missing-role",
      userId: user._id,
      email: user.email,
    });
    throw new InternalServerErrorException();
  }
  if (
    user.status == USER_STATUS.BANNED ||
    user.status == USER_STATUS.DEACTIVAED
  ) {
    activityLogger.warn({
      event: "user.login.blocked",
      userId: user._id,
      email: user.email,
      status: user.status,
    });
    throw new UnauthorizedException(
      "Your account has been suspended. Please contact support.",
    );
  }

  const { accessToken, refreshToken } = await generateTokens({
    id: user._id as unknown as string,
    email: user.email,
    role: user.role,
  });

  activityLogger.info({
    event: "user.login",
    userId: user._id,
    email: user.email,
  });

  return {
    accessToken,
    refreshToken,
    firstName: user.firstName,
  };
};

export const googleLogin = async (user: {
  _id: string;
  email: string;
  role: string;
  firstName: string;
}) => {
  const { accessToken, refreshToken } = await generateTokens({
    id: user._id as unknown as string,
    email: user.email,
    role: user.role as keyof typeof token_secrets,
  });

  activityLogger.info({
    event: "user.login.google",
    userId: user._id,
    email: user.email,
  });

  return { accessToken, refreshToken, firstName: user.firstName };
};

export const refreshToken = async (token: string) => {
  const { user, jti } = await decodeToken({
    token,
    type: "refresh",
  });
  if (!user)
    throw new UnauthorizedException("Invalid Session. Please try again");

  const accessToken = generateToken({
    payload: {
      _id: user._id as unknown as string,
      email: user.email,
      role: user.role as keyof typeof token_secrets,
    },
    options: {
      jwtid: jti,
      expiresIn: "30M",
    },
  });

  return accessToken;
};

export const sendVerificationEmail = async ({ email }: sendVerifyEmailDTO) => {
  const user = await userRepo.findOne({
    filter: {
      email,
    },
    projection: {
      _id: 1,
      isEmailVerified: 1,
      provider: 1,
    },
    options: {
      lean: false,
    },
  });
  if (!user) throw new NotFoundException("User not found");
  if (user.provider != PROVIDER.SYSTEM)
    throw new ForbiddenExceptions(
      "Email verification is only provided for accounts created with HireHub",
    );
  if (user.isEmailVerified == true)
    throw new ConflictException("User account already verified");

  const blockTtl = await redisService.getTTL(
    redisService.otpKeyBlock({ userId: user._id, subject: "confirm-email" }),
  );
  if (blockTtl > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTtl / 60)} minutes`,
    );

  const currentOtpTtl = await redisService.getTTL(
    redisService.otpKey({
      userId: user._id,
      subject: "confirm-email",
    }),
  );

  if (currentOtpTtl > 0)
    throw new TooManyRequestsException(
      `Please wait ${Math.ceil(currentOtpTtl / 60)} minutes before requesting a new code`,
    );

  const otp = generateOTP();
  const otpKey = redisService.otpKey({
    userId: user._id,
    subject: "confirm-email",
  });
  await redisService.set({
    key: otpKey,
    value: { hashedOTP: await argon2.hash(otp), attempts: 1 },
    ttl: 2 * 60,
  });
  await sendMail({
    to: email,
    subject: "Email Verification",
    html: `<h1>${otp}<h1>`,
  });

  activityLogger.info({
    event: "user.verify-email.otp-sent",
    userId: user._id,
    email,
  });
};

export const verifyEmail = async ({ email, otp }: confirmEmailDTO) => {
  const user = await userRepo.findOne({
    filter: { email },
    projection: { _id: 1, isEmailVerified: 1, provider: 1 },
    options: { lean: false },
  });

  if (!user) throw new NotFoundException("User not found");
  if (user.isEmailVerified)
    throw new ConflictException("Account already verified");

  const userId = user._id as Types.ObjectId;

  const blockKey = redisService.otpKeyBlock({
    userId,
    subject: "confirm-email",
  });
  const otpKey = redisService.otpKey({ userId, subject: "confirm-email" });

  const blockTtl = await redisService.getTTL(blockKey);
  if (blockTtl > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTtl / 60)} minutes`,
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
      activityLogger.warn({
        event: "user.verify-email.blocked",
        userId,
        email,
      });
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
    activityLogger.warn({
      event: "user.verify-email.otp-failed",
      userId,
      remainingAttempts: 5 - newAttempts,
    });
    throw new UnauthorizedException("Invalid verification code", {
      data: { remainingAttempts: 5 - newAttempts },
    });
  }

  user.isEmailVerified = true;
  await user.save();
  await redisService.del(otpKey);

  activityLogger.info({ event: "user.verify-email.success", userId, email });
};

export const sendForgotPasswordOTP = async ({
  email,
}: sendforgotPassowrdOtpDTO) => {
  const user = await userRepo.findOne({
    filter: {
      email,
    },
    projection: {
      _id: 1,
      provider: 1,
    },
    options: {
      lean: false,
    },
  });
  if (!user) throw new NotFoundException("User not found");
  if (user.provider != PROVIDER.SYSTEM)
    throw new ForbiddenExceptions(
      "Email verification is only provided for accounts created with HireHub",
    );

  const blockTtl = await redisService.getTTL(
    redisService.otpKeyBlock({ userId: user._id, subject: "forgot-password" }),
  );
  if (blockTtl > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTtl / 60)} minutes`,
    );

  const currentOtpTtl = await redisService.getTTL(
    redisService.otpKey({
      userId: user._id,
      subject: "forgot-password",
    }),
  );

  if (currentOtpTtl > 0)
    throw new TooManyRequestsException(
      `Please wait ${Math.ceil(currentOtpTtl / 60)} minutes before requesting a new code`,
    );

  const otp = generateOTP();
  const otpKey = redisService.otpKey({
    userId: user._id,
    subject: "forgot-password",
  });
  await redisService.set({
    key: otpKey,
    value: { hashedOTP: await argon2.hash(otp), attempts: 1 },
    ttl: 2 * 60,
  });
  await sendMail({
    to: email,
    subject: "Forgot Password",
    html: `<h1>${otp}<h1>`,
  });

  activityLogger.info({
    event: "user.forgot-password.otp-sent",
    userId: user._id,
    email,
  });
};

export const checkForgotPasswordOTP = async ({
  email,
  otp,
}: checkForgotPasswordOtpDTO) => {
  const user = await userRepo.findOne({
    filter: {
      email,
    },
    projection: {
      _id: 1,
      provider: 1,
    },
    options: {
      lean: false,
    },
  });
  if (!user) throw new NotFoundException("User not found");
  const userId = user._id as Types.ObjectId;

  const blockKey = redisService.otpKeyBlock({
    userId,
    subject: "forgot-password",
  });
  const otpKey = redisService.otpKey({ userId, subject: "forgot-password" });
  const blockTtl = await redisService.getTTL(blockKey);
  if (blockTtl > 0)
    throw new TooManyRequestsException(
      `Too many attempts. Try again in ${Math.ceil(blockTtl / 60)} minutes`,
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
      activityLogger.warn({
        event: "user.forgot-password.blocked",
        userId,
        email,
      });
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
    activityLogger.warn({
      event: "user.forgot-password.otp-failed",
      userId,
      remainingAttempts: 5 - newAttempts,
    });
    throw new UnauthorizedException("Invalid verification code", {
      data: { remainingAttempts: 5 - newAttempts },
    });
  }

  await redisService.set({
    key: otpKey,
    value: { verified: true },
    ttl: 10 * 60,
  });

  activityLogger.info({
    event: "user.forgot-password.otp-verified",
    userId,
    email,
  });
};

export const resetPassword = async ({
  email,
  newPassword,
}: resetPasswordDTO) => {
  const user = await userRepo.findOne({
    filter: { email },
    projection: { _id: 1, provider: 1 },
    options: { lean: true },
  });
  if (!user) throw new NotFoundException("User not found");

  const userId = user._id as Types.ObjectId;
  const otpKey = redisService.otpKey({ userId, subject: "forgot-password" });

  const otpRaw = (await redisService.get(otpKey)) as string | null;
  if (!otpRaw)
    throw new ForbiddenExceptions(
      "OTP verification required before resetting password",
    );

  const { verified } = JSON.parse(otpRaw) as { verified?: boolean };
  if (!verified)
    throw new ForbiddenExceptions(
      "OTP verification required before resetting password",
    );

  const hashedPassword = await argon2.hash(newPassword);
  await userRepo.updateOne({
    filter: { _id: userId },
    update: {
      $set: { password: hashedPassword, credentialsChangedAt: new Date() },
    },
  });

  await redisService.del(otpKey);

  activityLogger.info({ event: "user.password.reset", userId, email });
};

export const changePassword = async ({
  password,
  email,
  newPassword,
}: changePasswordDTO) => {
  const user = await userRepo.findOne({
    filter: { email },
    projection: { _id: 1, email: 1, password: 1, provider: 1 },
    options: { lean: true },
  });
  if (!user) throw new NotFoundException("User not found");

  if (user.provider !== PROVIDER.SYSTEM)
    throw new BadRequestException("Cannot change password for OAuth accounts");

  if (password === newPassword) {
    throw new BadRequestException(
      "New password must differ from current password",
    );
  }

  if (!(await argon2.verify(user.password as string, password))) {
    activityLogger.warn({
      event: "user.password.change-failed",
      userId: user._id,
      email,
    });
    throw new UnauthorizedException("Invalid password");
  }

  await userRepo.updateOne({
    filter: {
      _id: user._id,
      email: user.email,
    },
    update: {
      $set: {
        password: await argon2.hash(newPassword),
        credentialsChangedAt: new Date(),
      },
    },
  });

  activityLogger.info({
    event: "user.password.changed",
    userId: user._id,
    email,
  });
};
