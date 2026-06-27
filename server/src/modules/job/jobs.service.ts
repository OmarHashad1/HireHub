import { JOB_STATUS } from "./../../enums/job.enums.js";
import { JobRepo } from "../../repositories/job.repo.js";
import {
  BadRequestException,
  ForbiddenExceptions,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { IUser } from "../../types/user.types.js";
import { createJobDTO, updateJobDTO } from "../../schemas/job.schema.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import { FlattenMaps, Types, UpdateQuery } from "mongoose";
import { IJob } from "../../types/job.types.js";
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";

const companyRepo = new CompanyRepo();
const jobRepo = new JobRepo();

export const getPublishedJobs = async ({ page, size }: paginationQueryDTO) => {
  return jobRepo.paginate({
    filter: { status: JOB_STATUS.PUBLISHED },
    options: {
      lean: true,
      populate: { path: "company", select: { name: 1, logo: 1, industry: 1 } },
    },
    page,
    size,
  });
};

export const getPublishedJob = async (
  jobId: string,
): Promise<FlattenMaps<IJob>> => {
  const doc = await jobRepo.findOne({
    filter: { status: JOB_STATUS.PUBLISHED, _id: jobId },
    options: {
      lean: true,
      populate: { path: "company", select: { name: 1, logo: 1, industry: 1 } },
    },
  });
  if (!doc) throw new NotFoundException("Job not found");

  return doc;
};

export const getCompanyPublishedJobs = async (
  companyId: string,
  { page, size }: paginationQueryDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { _id: companyId, status: COMPANY_STATUS.ACTIVE },
    options: { lean: true },
    projection: { _id: 1 },
  });
  if (!company) throw new NotFoundException("Company not found");

  return jobRepo.paginate({
    filter: { company: company._id, status: JOB_STATUS.PUBLISHED },
    options: {
      lean: true,
      populate: { path: "company", select: { name: 1, logo: 1, industry: 1 } },
    },
    page,
    size,
  });
};

export const createJob = async (user: IUser, dto: createJobDTO) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id },
    options: { lean: true },
    projection: { _id: 1, name: 1, status: 1 },
  });

  if (!company) throw new NotFoundException("Company not found");
  if (company.status === COMPANY_STATUS.SUSPENDED)
    throw new BadRequestException("Company is suspended");

  const job = await jobRepo.create({
    data: {
      company: company._id,
      ...dto,
    },
  });

  activityLogger.info({
    event: "job.created",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.CREATE_JOB,
    targetType: LOG_TARGET_TYPE.JOB,
    targetId: job._id,
  });

  return job;
};

const loadOwnedJob = async (user: IUser, jobId: string) => {
  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: {
      lean: true,
      populate: { path: "company", select: { owner: 1, _id: 1 } },
    },
  });

  if (!job) throw new NotFoundException("Job not found");
  if (
    !(job.company as unknown as { owner: Types.ObjectId }).owner.equals(
      user._id,
    )
  ) {
    throw new ForbiddenExceptions(
      "User doesn't have permission to modify this job",
    );
  }
  return job;
};

export const updateJob = async (
  user: IUser,
  jobId: string,
  dto: updateJobDTO,
) => {
  const job = await loadOwnedJob(user, jobId);
  if (job.status === JOB_STATUS.SUSPENDED)
    throw new ForbiddenExceptions("Job is suspended and can not be modified");

  const { location, salary, ...rest } = dto;
  const update: UpdateQuery<IJob> = { ...rest };

  if (salary) {
    for (const [key, value] of Object.entries(salary)) {
      update[`salary.${key}`] = value;
    }
  }

  if (location) {
    const merged = { ...job.location, ...location };
    if (!merged.isRemote && (!merged.city || !merged.country)) {
      throw new BadRequestException(
        "city and country are required for non-remote jobs",
      );
    }
    for (const [key, value] of Object.entries(location)) {
      update[`location.${key}`] = value;
    }
  }

  const mergedAutoReject = dto.autoReject ?? job.autoReject;
  const mergedThreshold =
    dto.aiThreshold !== undefined ? dto.aiThreshold : job.aiThreshold;
  if (mergedAutoReject && mergedThreshold == null ) {
    throw new BadRequestException(
      "aiThreshold is required when autoReject is enabled",
    );
  }

  const result = await jobRepo.updateOne({ filter: { _id: job._id }, update });

  activityLogger.info({
    event: "job.updated",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.UPDATE_JOB,
    targetType: LOG_TARGET_TYPE.JOB,
    targetId: job._id,
  });

  return result;
};

export const deleteJob = async (user: IUser, jobId: string) => {
  const job = await loadOwnedJob(user, jobId);
  const result = await jobRepo.deleteOne({ filter: { _id: job._id } });

  activityLogger.info({
    event: "job.deleted",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.DELETE_JOB,
    targetType: LOG_TARGET_TYPE.JOB,
    targetId: job._id,
  });

  return result;
};

const transitionJobStatus = async (
  user: IUser,
  jobId: string,
  target: JOB_STATUS,
) => {
  const job = await loadOwnedJob(user, jobId);
  if (job.status === JOB_STATUS.SUSPENDED)
    throw new ForbiddenExceptions("Job is suspended and can not be modified");

  const requiredCurrentStatus: Partial<Record<JOB_STATUS, JOB_STATUS>> = {
    [JOB_STATUS.PUBLISHED]: JOB_STATUS.DRAFT,
    [JOB_STATUS.CLOSED]: JOB_STATUS.PUBLISHED,
  };

  if (job.status !== requiredCurrentStatus[target]) {
    throw new BadRequestException(
      `Cannot change job status from ${job.status} to ${target}`,
    );
  }

  const result = await jobRepo.updateOne({
    filter: { _id: job._id },
    update: { status: target },
  });

  const transitionAction: Partial<Record<JOB_STATUS, LOG_ACTION>> = {
    [JOB_STATUS.PUBLISHED]: LOG_ACTION.PUBLISH_JOB,
    [JOB_STATUS.CLOSED]: LOG_ACTION.CLOSE_JOB,
  };

  activityLogger.info({
    event: `job.${target}`,
    actor: user._id,
    email: user.email,
    action: transitionAction[target],
    targetType: LOG_TARGET_TYPE.JOB,
    targetId: job._id,
  });

  return result;
};

export const publishJob = (user: IUser, jobId: string) =>
  transitionJobStatus(user, jobId, JOB_STATUS.PUBLISHED);

export const closeJob = (user: IUser, jobId: string) =>
  transitionJobStatus(user, jobId, JOB_STATUS.CLOSED);
