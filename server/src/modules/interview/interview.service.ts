import mongoose, { Types } from "mongoose";
import { APPLICATION_STATUS } from "../../enums/application.enums.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import { ApplicationRepo } from "../../repositories/application.repo.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { InterviewRepo } from "../../repositories/interview repo.js";
import { scheduleInterviewDTO } from "../../schemas/interview.schema.js";
import { IUser } from "../../types/user.types.js";
import {
  ConflictException,
  ForbiddenExceptions,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { USER_STATUS } from "../../enums/user.enums.js";
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import {
  notificationEmitter,
  NOTIFICATION_EVENTS,
} from "../../events/notification.events.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";

const interviewRepo = new InterviewRepo();
const applicationRepo = new ApplicationRepo();
const companyRepo = new CompanyRepo();
const userRepo = new UserRepo();

export const scheduleInterview = async (
  user: IUser,
  dto: scheduleInterviewDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    options: { lean: true },
  });

  if (!company) {
    throw new NotFoundException(
      "No active company is linked to your account, so you cannot schedule an interview",
    );
  }

  const application = await applicationRepo.findOne({
    filter: { _id: dto.application },
    options: {
      lean: false,
      populate: { path: "job", select: { company: 1 } },
    },
  });

  if (!application)
    throw new NotFoundException(
      "Application not found. It may have been removed or the id is incorrect.",
    );

  if (
    !(application.job as unknown as { company: Types.ObjectId }).company.equals(
      company._id,
    )
  ) {
    throw new ForbiddenExceptions(
      "You cannot schedule an interview for an application to another company's job",
    );
  }

  const applicant = await userRepo.findOne({
    filter: {
      _id: application.applicant,
    },
    options: { lean: true },
    projection: {
      status: 1,
    },
  });

  if (!applicant)
    throw new NotFoundException(
      "Applicant not found. It may have been removed or the id is incorrect.",
    );

  if (applicant.status == USER_STATUS.BANNED)
    throw new ForbiddenExceptions(
      "This applicant's account has been banned, so an interview cannot be scheduled with them.",
    );

  if (application.status === APPLICATION_STATUS.WITHDRAWN)
    throw new ConflictException(
      "This application has been withdrawn by the applicant",
    );

  if (application.status != APPLICATION_STATUS.APPLIED) {
    throw new ConflictException(
      `An interview can only be scheduled for an application in the applied stage. This application is currently ${application.status}.`,
    );
  }

  const session = await mongoose.startSession();
  let interview;
  try {
    await session.withTransaction(async () => {
      await applicationRepo.updateOne({
        filter: { _id: application._id },
        update: { status: APPLICATION_STATUS.INTERVIEW },
        options: { session },
      });

      interview = await interviewRepo.create({
        data: {
          application: application._id,
          job: (application.job as unknown as { _id: Types.ObjectId })._id,
          company: company._id,
          applicant: application.applicant,
          type: dto.type,
          scheduledAt: dto.scheduledAt,
        },
        options: { session },
      });
    });
  } finally {
    session.endSession();
  }

  activityLogger.info({
    event: "interview.scheduled",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.SCHEDULE_INTERVIEW,
    targetType: LOG_TARGET_TYPE.INTERVIEW,
    targetId: interview!._id,
  });

  notificationEmitter.emit(NOTIFICATION_EVENTS.INTERVIEW_SCHEDULED, {
    userId: application.applicant,
    scheduledAt: dto.scheduledAt,
  });

  return { interview };
};

export const getCompanyInterviews = async (
  user: IUser,
  companyId: string,
  paginatedto: paginationQueryDTO,
) => {
  const company = await companyRepo.findOne({
    filter: {
      _id: companyId,
    },
    options: {
      lean: true,
    },
    projection: { owner: 1, _id: 1, status: 1 },
  });

  if (!company) {
    throw new NotFoundException("Company not found");
  }

  if (!company.owner.equals(user._id)) {
    throw new ForbiddenExceptions(
      "You cannot don't have permission to access this data",
    );
  }

  const interviews = await interviewRepo.paginate({
    filter: {
      company: companyId,
    },
    options: {
      lean: true,
    },
    page: paginatedto.page,
    size: paginatedto.size,
  });
  return interviews;
};
