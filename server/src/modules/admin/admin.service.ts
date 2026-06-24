import mongoose, { UpdateQuery } from "mongoose";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import { COMPANY_APPLICATION_STATUS } from "../../enums/companyApplication.enums.js";
import { ROLE, USER_STATUS } from "../../enums/user.enums.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { generatePassword } from "../../utils/generatePasssword.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { activityLogger } from "../../utils/logger.util.js";
import {
  NOTIFICATION_EVENTS,
  notificationEmitter,
} from "../../events/notification.events.js";
import { EMAIL_EVENTS, emailEmitter } from "../../events/email.events.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { updateCompanyApplicationStatusDTO } from "../../schemas/company.schema.js";
import { IUser } from "../../types/user.types.js";
import { CompanyRepo } from "../../repositories/company.repo.js";

import { CompanyApplicationRepo } from "../../repositories/companyApplication.repo.js";
import { updateUserStatusDTO } from "../../schemas/admin.schema.js";

const userRepo = new UserRepo();
const applicationRepo = new CompanyApplicationRepo();
const companyRepo = new CompanyRepo();

export const getAllUsers = async (dto: paginationQueryDTO) => {
  const paylaod = await userRepo.paginate({
    filter: { role: { $ne: ROLE.ADMIN } },
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

export const updateCompanyApplicationStatus = async (
  admin: IUser,
  dto: updateCompanyApplicationStatusDTO,
) => {
  const application = await applicationRepo.findOne({
    filter: { _id: dto.applicationID },
    options: { lean: false },
  });
  if (!application) throw new NotFoundException("Application not found");

  if (
    application.status == COMPANY_APPLICATION_STATUS.APPROVED ||
    application.status == COMPANY_APPLICATION_STATUS.REJECTED
  )
    throw new BadRequestException(
      "Company Application stauts can not modified after approval or rejection",
    );

  const submitter = await userRepo.findOne({
    filter: { _id: application.submittedBy },
    options: { lean: true },
  });
  if (!submitter) {
    await applicationRepo.deleteOne({ filter: { _id: application._id } });
    throw new NotFoundException("Submitter account no longer exists");
  }
  if (dto.status === COMPANY_APPLICATION_STATUS.REJECTED) {
    await applicationRepo.updateOne({
      filter: { _id: application._id },
      update: {
        status: COMPANY_APPLICATION_STATUS.REJECTED,
        rejectionReason: dto.rejectionReason,
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
    });
    emailEmitter.emit(EMAIL_EVENTS.APPLICATION_STATUS_UPDATE, {
      to: application.companyEmail,
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    });

    notificationEmitter.emit(NOTIFICATION_EVENTS.COMPANY_APPLICATION_DECISION, {
      userId: submitter._id,
      status: dto.status,
    });

    activityLogger.info({
      event: "company.application.rejected",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.REJECT_COMPANY_APPLICATION,
      targetType: LOG_TARGET_TYPE.COMPANY_APPLICATION,
      targetId: application._id,
    });
    return;
  } else {
    const tempPassword = generatePassword();

    const session = await mongoose.startSession();
    let recruiter;
    try {
      await session.withTransaction(async () => {
        recruiter = await userRepo.create({
          data: {
            firstName: submitter.firstName,
            lastName: submitter.lastName,
            email: application.companyEmail,
            password: tempPassword,
            phoneNumber: application.contactPhone,
            role: ROLE.COMPANY,
            isEmailVerified: true,
          },
          options: { session },
        });
        await companyRepo.create({
          data: {
            owner: recruiter,
            companyApplication: application._id,
            name: application.companyName,
            email: application.companyEmail,
            industry: application.industry,
            size: application.size,
            location: application.location,
            description: application.description,
            documents: application.documents,
            website: application.website ?? null,
            foundedAt: application.foundedAt ?? null,
            socialMedia: {
              linkedin: application.linkedin ?? null,
            },
            status: COMPANY_STATUS.ACTIVE,
          },
          options: { session },
        });
        await applicationRepo.updateOne({
          filter: { _id: application._id },
          update: {
            status: COMPANY_APPLICATION_STATUS.APPROVED,
            reviewedBy: admin._id,
            reviewedAt: new Date(),
          },
          options: { session },
        });
      });
    } finally {
      session.endSession();
    }
    emailEmitter.emit(EMAIL_EVENTS.COMPANY_ACCOUNT_CREATED, {
      to: application.companyEmail,
      email: application.companyEmail,
      password: tempPassword,
    });

    notificationEmitter.emit(NOTIFICATION_EVENTS.COMPANY_APPLICATION_DECISION, {
      userId: submitter._id,
      status: dto.status,
    });

    activityLogger.info({
      event: "company.application.approved",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.APPROVE_COMPANY_APPLICATION,
      targetType: LOG_TARGET_TYPE.COMPANY_APPLICATION,
      targetId: application._id,
    });
  }
};

export const getUser = async (userId: string) => {
  const user = await userRepo.findOne({
    filter: { _id: userId, role: { $ne: ROLE.ADMIN } },
    options: { lean: true },
  });

  if (!user)
    throw new NotFoundException(
      `ser with id ${userId} not found or can't it's information can't be fetched`,
    );

  return user;
};

export const updateUserStatus = async (
  admin: IUser,
  dto: updateUserStatusDTO,
  userId: string,
) => {
  const user = await userRepo.findOne({
    filter: { _id: userId, role: { $ne: ROLE.ADMIN } },
    options: { lean: true },
  });
  if (!user)
    throw new NotFoundException(
      `User with id ${userId} not found or can't it's information can't be fetched`,
    );

  const requiredStatus: Partial<Record<USER_STATUS, USER_STATUS>> = {
    [USER_STATUS.ACTIVE]: USER_STATUS.BANNED,
    [USER_STATUS.BANNED]: USER_STATUS.ACTIVE,
  };

  if (user.status != requiredStatus[dto.status]) {
    throw new ConflictException(
      `Can't set the status of the user from ${user.status} to ${dto.status}`,
    );
  }

  const update: UpdateQuery<IUser> =
    dto.status === USER_STATUS.ACTIVE
      ? { status: USER_STATUS.ACTIVE, $unset: { banReason: 1 } }
      : { status: dto.status, banReason: dto.banReason };

  await userRepo.updateOne({ filter: { _id: user._id }, update });

  if (dto.status === USER_STATUS.BANNED) {
    emailEmitter.emit(EMAIL_EVENTS.ACCOUNT_BAN, {
      banReason: dto.banReason as string,
      to: user.email,
    });

    activityLogger.info({
      event: "user.banned",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.BAN_USER,
      targetType: LOG_TARGET_TYPE.USER,
      targetId: user._id,
    });
  }

  if (dto.status === USER_STATUS.ACTIVE) {
    emailEmitter.emit(EMAIL_EVENTS.ACCOUNT_ACTIVE, {
      to: user.email,
    });

    activityLogger.info({
      event: "user.unbanned",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.UNBAN_USER,
      targetType: LOG_TARGET_TYPE.USER,
      targetId: user._id,
    });
  }
  return;
};
