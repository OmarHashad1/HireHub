import { JOB_STATUS } from "./../../enums/job.enums.js";
import { JobRepo } from "../../repositories/job.repo.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { IUser } from "../../types/user.types.js";
import { createJobDTO } from "../../schemas/job.schema.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";

const companyRepo = new CompanyRepo();
const jobRepo = new JobRepo();

export const getPublishedJobs = async () => {
  return jobRepo.find({
    filter: { status: JOB_STATUS.PUBLISHED },
    options: { lean: true },
  });
};

export const getPublishedJob = async (jobId: string) => {
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

export const updateJob = async (user: IUser, jobId: string) => {
  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: {
      lean: false,
      populate: { path: "company", select: { owner: 1, _id: 1 } },
    },
  });

  if (!job) {
    throw new NotFoundException("Job not found");
  }

};
