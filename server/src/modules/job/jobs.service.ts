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

const companyRepo = new CompanyRepo();
const jobRepo = new JobRepo();

export const getPublishedJobs = async () => {
  return jobRepo.find({
    filter: { status: JOB_STATUS.PUBLISHED },
    options: { lean: true },
  });
};

export const getPublishedJob = async (
  jobId: string,
): Promise<FlattenMaps<IJob>> => {
  const doc = await jobRepo.findOne({
    filter: { status: JOB_STATUS.PUBLISHED, _id: jobId },
    options: { lean: true },
  });
  if (!doc) throw new NotFoundException("Job not found");

  return doc;
};

export const getCompanyPublishedJobs = async (companyId: string) => {
  const company = await companyRepo.findOne({
    filter: { _id: companyId, status: COMPANY_STATUS.ACTIVE },
    options: { lean: true },
    projection: { _id: 1 },
  });
  if (!company) throw new NotFoundException("Company not found");

  return jobRepo.find({
    filter: { company: company._id, status: JOB_STATUS.PUBLISHED },
    options: { lean: true },
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

  return await jobRepo.create({
    data: {
      company: company._id,
      ...dto,
    },
  });
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

  return await jobRepo.updateOne({ filter: { _id: job._id }, update });
};

export const deleteJob = async (user: IUser, jobId: string) => {
  const job = await loadOwnedJob(user, jobId);
  return await jobRepo.deleteOne({ filter: { _id: job._id } });
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

  return jobRepo.updateOne({
    filter: { _id: job._id },
    update: { status: target },
  });
};

export const publishJob = (user: IUser, jobId: string) =>
  transitionJobStatus(user, jobId, JOB_STATUS.PUBLISHED);

export const closeJob = (user: IUser, jobId: string) =>
  transitionJobStatus(user, jobId, JOB_STATUS.CLOSED);
