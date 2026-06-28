import mongoose, { UpdateQuery } from "mongoose";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import { COMPANY_APPLICATION_STATUS } from "../../enums/companyApplication.enums.js";
import { JOB_STATUS } from "../../enums/job.enums.js";
import { REPORT_STATUS } from "../../enums/report.enums.js";
import { ROLE, USER_STATUS } from "../../enums/user.enums.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { generatePassword } from "../../utils/generatePasssword.util.js";
import { LOG_ACTION, LOG_LEVEL, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
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
import { ICompany } from "../../types/company.types.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { JobRepo } from "../../repositories/job.repo.js";
import { ApplicationRepo } from "../../repositories/application.repo.js";
import { ReportRepo } from "../../repositories/report.repo.js";
import { LogRepo } from "../../repositories/log.repo.js";
import {
  userModel,
  companyModel,
  jobModel,
  applicationModel,
  reportModel,
  companyApplicationModel,
} from "../../models/index.js";

import { CompanyApplicationRepo } from "../../repositories/companyApplication.repo.js";
import {
  updateCompanyStatusDTO,
  updateJobStatusDTO,
  updateReportStatusDTO,
  updateUserStatusDTO,
} from "../../schemas/admin.schema.js";

const userRepo = new UserRepo();
const applicationRepo = new CompanyApplicationRepo();
const companyRepo = new CompanyRepo();
const jobRepo = new JobRepo();
const jobApplicationRepo = new ApplicationRepo();
const reportRepo = new ReportRepo();
const logRepo = new LogRepo();

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

export const getAllCompanyApplications = async (dto: paginationQueryDTO) => {
  const paylaod = await applicationRepo.paginate({
    filter: {},
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

export const getCompanyApplication = async (applicationId: string) => {
  const application = await applicationRepo.findOne({
    filter: { _id: applicationId },
    options: { lean: true },
  });

  if (!application)
    throw new NotFoundException(
      `Company application with id ${applicationId} not found`,
    );

  return application;
};

export const getAllCompanies = async (dto: paginationQueryDTO) => {
  const paylaod = await companyRepo.paginate({
    filter: {},
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

export const getCompany = async (companyId: string) => {
  const company = await companyRepo.findOne({
    filter: { _id: companyId },
    options: { lean: true },
  });

  if (!company)
    throw new NotFoundException(`Company with id ${companyId} not found`);

  return company;
};

export const updateCompanyStatus = async (
  admin: IUser,
  dto: updateCompanyStatusDTO,
  companyId: string,
) => {
  const company = await companyRepo.findOne({
    filter: { _id: companyId },
    options: { lean: true },
  });
  if (!company)
    throw new NotFoundException(`Company with id ${companyId} not found`);

  const requiredStatus: Partial<Record<COMPANY_STATUS, COMPANY_STATUS>> = {
    [COMPANY_STATUS.ACTIVE]: COMPANY_STATUS.SUSPENDED,
    [COMPANY_STATUS.SUSPENDED]: COMPANY_STATUS.ACTIVE,
  };

  if (company.status != requiredStatus[dto.status]) {
    throw new ConflictException(
      `Can't set the status of the company from ${company.status} to ${dto.status}`,
    );
  }

  const update: UpdateQuery<ICompany> =
    dto.status === COMPANY_STATUS.ACTIVE
      ? { status: COMPANY_STATUS.ACTIVE, $unset: { suspendReason: 1 } }
      : { status: dto.status, suspendReason: dto.suspendReason };

  await companyRepo.updateOne({ filter: { _id: company._id }, update });

  if (dto.status === COMPANY_STATUS.SUSPENDED) {
    emailEmitter.emit(EMAIL_EVENTS.ACCOUNT_BAN, {
      banReason: dto.suspendReason as string,
      to: company.email,
    });

    activityLogger.info({
      event: "company.banned",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.BAN_COMPANY,
      targetType: LOG_TARGET_TYPE.COMPANY,
      targetId: company._id,
    });
  }

  if (dto.status === COMPANY_STATUS.ACTIVE) {
    emailEmitter.emit(EMAIL_EVENTS.ACCOUNT_ACTIVE, {
      to: company.email,
    });

    activityLogger.info({
      event: "company.unbanned",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.UNBAN_COMPANY,
      targetType: LOG_TARGET_TYPE.COMPANY,
      targetId: company._id,
    });
  }
  return;
};

export const getAllJobs = async (dto: paginationQueryDTO) => {
  const paylaod = await jobRepo.paginate({
    filter: {},
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

export const getAllApplications = async (dto: paginationQueryDTO) => {
  const paylaod = await jobApplicationRepo.paginate({
    filter: {},
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

export const getApplication = async (applicationId: string) => {
  const application = await jobApplicationRepo.findOne({
    filter: { _id: applicationId },
    options: { lean: true },
  });

  if (!application)
    throw new NotFoundException(
      `Application with id ${applicationId} not found`,
    );

  return application;
};

export const getJob = async (jobId: string) => {
  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: { lean: true },
  });
  if (!job) throw new NotFoundException(`Job with id ${jobId} not found`);

  const applications = await jobApplicationRepo.find({
    filter: { job: job._id },
    options: { lean: true },
  });

  return { job, applications };
};

export const updateJobStatus = async (
  admin: IUser,
  dto: updateJobStatusDTO,
  jobId: string,
) => {
  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: { lean: true },
  });
  if (!job) throw new NotFoundException(`Job with id ${jobId} not found`);

  if (dto.status === JOB_STATUS.FLAGGED) {
    if (job.status === JOB_STATUS.FLAGGED)
      throw new ConflictException("Job is already flagged");
  } else if (job.status !== JOB_STATUS.FLAGGED) {
    throw new ConflictException(
      `Can't set the status of the job from ${job.status} to ${dto.status}`,
    );
  }

  await jobRepo.updateOne({
    filter: { _id: job._id },
    update: { status: dto.status },
  });

  if (dto.status === JOB_STATUS.FLAGGED) {
    activityLogger.info({
      event: "job.flagged",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.FLAG_JOB,
      targetType: LOG_TARGET_TYPE.JOB,
      targetId: job._id,
    });
  }

  if (dto.status === JOB_STATUS.PUBLISHED) {
    activityLogger.info({
      event: "job.unflagged",
      actor: admin._id,
      email: admin.email,
      action: LOG_ACTION.UNFLAG_JOB,
      targetType: LOG_TARGET_TYPE.JOB,
      targetId: job._id,
    });
  }
  return;
};

export const getAllReports = async (dto: paginationQueryDTO) => {
  const paylaod = await reportRepo.paginate({
    filter: {},
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

export const getReport = async (reportId: string) => {
  const report = await reportRepo.findOne({
    filter: { _id: reportId },
    options: { lean: true },
  });

  if (!report)
    throw new NotFoundException(`Report with id ${reportId} not found`);

  return report;
};

export const updateReportStatus = async (
  admin: IUser,
  dto: updateReportStatusDTO,
  reportId: string,
) => {
  const report = await reportRepo.findOne({
    filter: { _id: reportId },
    options: { lean: true },
  });
  if (!report)
    throw new NotFoundException(`Report with id ${reportId} not found`);

  if (report.status !== REPORT_STATUS.PENDING)
    throw new ConflictException(`Report has already been ${report.status}`);

  await reportRepo.updateOne({
    filter: { _id: report._id },
    update: {
      status: dto.status,
      resolvedBy: admin._id,
      resolvedAt: new Date(),
      resolutionNote: dto.resolutionNote ?? null,
    },
  });

  const action =
    dto.status === REPORT_STATUS.RESOLVED
      ? LOG_ACTION.RESOLVE_REPORT
      : LOG_ACTION.DISMISS_REPORT;

  activityLogger.info({
    event: `report.${dto.status}`,
    actor: admin._id,
    email: admin.email,
    action,
    targetType: LOG_TARGET_TYPE.REPORT,
    targetId: report._id,
  });
  return;
};

export const getLogs = async (dto: paginationQueryDTO) => {
  const paylaod = await logRepo.paginate({
    filter: { level: LOG_LEVEL.Info },
    options: { lean: true, sort: { createdAt: -1 } },
    page: dto.page,
    size: dto.size,
  });

  return paylaod;
};

type StatusCount = { _id: string | null; count: number };

const toBreakdown = (rows: StatusCount[]): Record<string, number> =>
  rows.reduce<Record<string, number>>((acc, row) => {
    if (row._id) acc[row._id] = row.count;
    return acc;
  }, {});

const groupByStatus = [{ $group: { _id: "$status", count: { $sum: 1 } } }];

export const getStats = async () => {
  const [
    users,
    companies,
    jobs,
    applications,
    reports,
    pendingCompanyApplications,
    jobRows,
    applicationRows,
    reportRows,
  ] = await Promise.all([
    userModel.countDocuments({ role: ROLE.USER }),
    companyModel.countDocuments({}),
    jobModel.countDocuments({}),
    applicationModel.countDocuments({}),
    reportModel.countDocuments({}),
    companyApplicationModel.countDocuments({
      status: COMPANY_APPLICATION_STATUS.PENDING,
    }),
    jobModel.aggregate<StatusCount>(groupByStatus),
    applicationModel.aggregate<StatusCount>(groupByStatus),
    reportModel.aggregate<StatusCount>(groupByStatus),
  ]);

  return {
    users,
    companies,
    jobs,
    applications,
    reports,
    pendingCompanyApplications,
    pendingReports: toBreakdown(reportRows)[REPORT_STATUS.PENDING] ?? 0,
    jobsByStatus: toBreakdown(jobRows),
    applicationsByStatus: toBreakdown(applicationRows),
    reportsByStatus: toBreakdown(reportRows),
  };
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
