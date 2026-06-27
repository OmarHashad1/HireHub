import mongoose, { Types, UpdateQuery } from "mongoose";
import { APPLICATION_STATUS } from "../../enums/application.enums.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import { ApplicationRepo } from "../../repositories/application.repo.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { InterviewRepo } from "../../repositories/interview repo.js";
import {
  scheduleInterviewDTO,
  updateScheduledInterviewDTO,
} from "../../schemas/interview.schema.js";
import { IUser } from "../../types/user.types.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenExceptions,
  InternalServerErrorException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { USER_STATUS } from "../../enums/user.enums.js";
import { activityLogger, serverLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import {
  notificationEmitter,
  NOTIFICATION_EVENTS,
} from "../../events/notification.events.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { INTERVIEW_STATUS } from "../../enums/interview.enums.js";
import { IInterview } from "../../types/inteview.types.js";

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
  } catch (err) {
    serverLogger.error({
      event: "interview.schedule.failed",
      actor: user._id,
      application: application._id,
      err,
    });
    throw new InternalServerErrorException("Failed to schedule the interview");
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
      populate: [
        {
          path: "applicant",
          select: { firstName: 1, lastName: 1, avatar: 1, headline: 1 },
        },
        { path: "job", select: { title: 1 } },
      ],
    },
    page: paginatedto.page,
    size: paginatedto.size,
  });
  return interviews;
};

export const getUserInterviews = async (
  user: IUser,
  { page, size }: paginationQueryDTO,
) => {
  const interviews = await interviewRepo.paginate({
    filter: {
      applicant: user._id,
    },
    options: {
      lean: true,
    },
    page,
    size,
  });
  return interviews;
};

export const updateScheduledInterview = async (
  user: IUser,
  interviewId: string,
  dto: updateScheduledInterviewDTO,
) => {
  const interview = await interviewRepo.findOne({
    filter: { _id: interviewId },
    options: {
      lean: true,
      populate: [
        {
          path: "company",
          select: { owner: 1 },
        },
        { path: "job", select: "title" },
      ],
    },
  });

  if (!interview)
    throw new NotFoundException(`No interview found with id ${interviewId}`);

  if (
    !(interview.company as unknown as { owner: Types.ObjectId }).owner.equals(
      user._id,
    )
  )
    throw new ForbiddenExceptions(
      "You don't have permission to update this interview because it belongs to another company",
    );
  if (interview.status != INTERVIEW_STATUS.SCHEDULED)
    throw new ConflictException(
      `Only interviews with status ${INTERVIEW_STATUS.SCHEDULED} can be updated; this interview is ${interview.status}`,
    );

  if (dto.status === INTERVIEW_STATUS.CANCELLED && !dto.cancellationReason) {
    throw new BadRequestException(
      "A cacellation reason is required when cancelling an interview",
    );
  }
  if (
    dto.scheduledAt &&
    new Date(dto.scheduledAt).getTime() == interview.scheduledAt.getTime()
  )
    throw new BadRequestException(
      "The new schedule must be different from the current schedule",
    );

  if (dto.type && dto.type == interview.type)
    throw new BadRequestException(
      "Interview type must be different from the current type",
    );

  const update: UpdateQuery<IInterview> = {
    ...(dto.status && { status: dto.status }),
    ...(dto.cancellationReason && {
      cancellationReason: dto.cancellationReason,
    }),
    ...(dto.scheduledAt && { scheduledAt: dto.scheduledAt }),
    ...(dto.type && { type: dto.type }),
  };

  await interviewRepo.updateOne({ filter: { _id: interview._id }, update });

  const isCancellation = dto.status === INTERVIEW_STATUS.CANCELLED;
  activityLogger.info({
    event: isCancellation ? "interview.cancelled" : "interview.updated",
    actor: user._id,
    email: user.email,
    action: isCancellation
      ? LOG_ACTION.CANCEL_INTERVIEW
      : LOG_ACTION.UPDATE_INTERVIEW,
    targetType: LOG_TARGET_TYPE.INTERVIEW,
    targetId: interview._id,
  });

  const jobTitle = (interview.job as unknown as { title: string }).title;

  if (dto.status === INTERVIEW_STATUS.CANCELLED)
    notificationEmitter.emit(NOTIFICATION_EVENTS.INTERVIEW_CANCELLED, {
      userId: interview.applicant,
      jobTitle,
    });

  if (dto.scheduledAt)
    notificationEmitter.emit(NOTIFICATION_EVENTS.INTERVIEW_RESCHEDULED, {
      userId: interview.applicant,
      jobTitle,
      scheduledAt: dto.scheduledAt,
    });

  return;
};
