import { REPORT_STATUS, REPORT_TARGET_TYPE } from "../../enums/report.enums.js";
import { ROLE, USER_STATUS } from "../../enums/user.enums.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { ReportRepo } from "../../repositories/report.repo.js";
import { UserRepo } from "../../repositories/user.repo.js";
import {
  companyReportDTO,
  userReportDTO,
} from "../../schemas/report.schema.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { IUser } from "../../types/user.types.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenExceptions,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { emailEmitter, EMAIL_EVENTS } from "../../events/email.events.js";

const companyRepo = new CompanyRepo();
const reportRepo = new ReportRepo();
const userRepo = new UserRepo();

export const reportCompany = async (
  user: IUser,
  companyId: string,
  dto: companyReportDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { _id: companyId },
    options: { lean: true },
  });
  if (!company) throw new NotFoundException("Company not found");

  const reportExist = await reportRepo.findOne({
    filter: {
      reportedBy: user._id,
      targetId: companyId,
      targetType: REPORT_TARGET_TYPE.COMPANY,
      status: REPORT_STATUS.PENDING,
    },
    options: { lean: true },
  });

  if (reportExist)
    throw new ConflictException("There is a pending report for this company");

  const report = await reportRepo.create({
    data: {
      reportedBy: user._id,
      targetType: REPORT_TARGET_TYPE.COMPANY,
      targetId: companyId,
      ...dto,
    },
  });

  activityLogger.info({
    event: "report.company",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.REPORT_COMPANY,
    targetType: LOG_TARGET_TYPE.COMPANY,
    targetId: companyId,
  });

  emailEmitter.emit(EMAIL_EVENTS.REPORT_RECEIVED, {
    to: user.email,
    targetType: REPORT_TARGET_TYPE.COMPANY,
  });

  return report;
};

export const getCompanyReports = async (
  companyUser: IUser,
  dto: paginationQueryDTO,
) => {
  return reportRepo.paginate({
    filter: {
      reportedBy: companyUser._id,
      targetType: REPORT_TARGET_TYPE.USER,
    },
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });
};

export const getUserReports = async (
  user: IUser,
  dto: paginationQueryDTO,
) => {
  return reportRepo.paginate({
    filter: { reportedBy: user._id, targetType: REPORT_TARGET_TYPE.COMPANY },
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });
};

export const reportUser = async (
  companyUser: IUser,
  userId: string,
  dto: userReportDTO,
) => {
  const { companyId, ...reportData } = dto;

  const companyExist = await companyRepo.findOne({
    filter: { _id: companyId },
    options: { lean: true },
  });
  if (!companyExist) throw new NotFoundException("Company not found");
  if (!companyExist.owner.equals(companyUser._id))
    throw new ForbiddenExceptions("User doesn't own the company");

  const userExist = await userRepo.findOne({
    filter: { _id: userId },
    options: { lean: true },
    projection: { status: 1, _id: 1, role: 1 },
  });
  if (!userExist) throw new NotFoundException("User not found");
  if (userExist.status == USER_STATUS.BANNED)
    throw new ConflictException("User account is banned ");
  if (userExist.role != ROLE.USER)
    throw new BadRequestException("Reported user can't be admin or company");
  const reportExist = await reportRepo.findOne({
    filter: {
      reportedBy: companyUser._id,
      targetId: userId,
      targetType: REPORT_TARGET_TYPE.USER,
      status: REPORT_STATUS.PENDING,
    },
    options: { lean: true },
  });

  if (reportExist)
    throw new ConflictException("There is a pending report for this user");

  const report = await reportRepo.create({
    data: {
      reportedBy: companyUser._id,
      targetType: REPORT_TARGET_TYPE.USER,
      targetId: userId,
      ...reportData,
    },
  });

  activityLogger.info({
    event: "report.user",
    actor: companyUser._id,
    email: companyUser.email,
    action: LOG_ACTION.REPORT_USER,
    targetType: LOG_TARGET_TYPE.USER,
    targetId: userId,
  });

  emailEmitter.emit(EMAIL_EVENTS.REPORT_RECEIVED, {
    to: companyUser.email,
    targetType: REPORT_TARGET_TYPE.USER,
  });

  return report;
};
