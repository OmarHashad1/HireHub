import { Types } from "mongoose";
import { APPLICATION_STATUS } from "../../enums/application.enums.js";
import { JOB_STATUS } from "../../enums/job.enums.js";
import { ROLE } from "../../enums/user.enums.js";
import { ApplicationRepo } from "../../repositories/application.repo.js";
import { JobRepo } from "../../repositories/job.repo.js";
import { createApplicationDTO } from "../../schemas/application.schema.js";
import { IUser } from "../../types/user.types.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenExceptions,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import {
  assetExists,
  copyAsset,
  deleteAsset,
  uploadAsset,
} from "../../utils/s3.util.js";
import { multerStorageType } from "../../enums/multer.enums.js";
import { APPLICATION_NAME } from "../../configs/env.config.js";
import { randomUUID } from "node:crypto";

const applicationRepo = new ApplicationRepo();
const jobRepo = new JobRepo();

export const getUserApplications = async (user: IUser) => {
  const payload = await applicationRepo.find({
    filter: {
      applicant: user._id,
    },
    options: {
      lean: true,
    },
  });

  return payload;
};

export const getSingleApplication = async (
  user: IUser,
  applicationId: string,
) => {
  const application = await applicationRepo.findOne({
    filter: { _id: applicationId },
    options: { lean: true },
  });
  if (!application)
    throw new NotFoundException(
      "Application not found. It may have been removed or the id is incorrect.",
    );

  if (user.role == ROLE.USER && !application.applicant.equals(user._id))
    throw new ForbiddenExceptions(
      "You do not have permission to access this application. You can only view your own applications.",
    );

  return application;
};

export const withdrawApplication = async (
  user: IUser,
  applicationId: string,
) => {
  const application = await applicationRepo.findOne({
    filter: { _id: applicationId },
    options: { lean: false },
  });
  if (!application)
    throw new NotFoundException(
      "Application not found. It may have been removed or the id is incorrect.",
    );

  if (user.role == ROLE.USER && !application.applicant.equals(user._id))
    throw new ForbiddenExceptions(
      "You do not have permission to withdraw this application. You can only withdraw your own applications.",
    );

  const WITHDRAWABLE = [
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.REVIEWED,
    APPLICATION_STATUS.INTERVIEW,
  ];
  if (!WITHDRAWABLE.includes(application.status))
    throw new BadRequestException(
      `This application cannot be withdrawn because it is "${application.status}". Only applications that are applied, under review, or in the interview stage can be withdrawn.`,
    );

  application.status = APPLICATION_STATUS.WITHDRAWN;
  application.withdrawnAt = new Date();
  return await application.save();
};

export const createApplication = async (
  user: IUser,
  jobId: string,
  dto: createApplicationDTO,
  cv?: Express.Multer.File,
) => {
  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: { lean: true },
  });



  if (!job)
    throw new NotFoundException(
      "Job not found. It may have been removed or the id is incorrect.",
    );

  if (job.status != JOB_STATUS.PUBLISHED)
    throw new BadRequestException(
      `This job is not accepting applications because it is ${job.status.toString()}. You can only apply to published jobs.`,
    );

  if (job.deadline && job.deadline < new Date()) {
    throw new BadRequestException(
      "The application deadline for this job has passed. This job is no longer accepting applications.",
    );
  }
  const existing = await applicationRepo.findOne({
    filter: { job: job._id, applicant: user._id },
    options: { lean: true },
  });
  if (existing)
    throw new ConflictException("You have already applied to this job.");

  const _id = new Types.ObjectId();
  
  let cvKey: string;
  if (cv) {
    cvKey = await uploadAsset({
      file: cv,
      path: `application/${_id}`,
      storageStrategy: multerStorageType.DESK,
    });
  } else if (user.cv) {
    if (!(await assetExists({ Key: user.cv })))
      throw new BadRequestException(
        "Your profile CV could not be found. Please upload a CV with this application.",
      );
    cvKey = await copyAsset({
      sourceKey: user.cv,
      destKey: `${APPLICATION_NAME}/application/${_id}/cv/${randomUUID()}`,
    });
  } else {
    throw new BadRequestException(
      "A CV is required to apply. Upload one with your application or add a CV to your profile first.",
    );
  }

  try {
    const application = await applicationRepo.create({
      data: { _id, job: job._id, applicant: user._id, cv: cvKey, ...dto },
    });
    return application;
  } catch (err) {
    await deleteAsset({ Key: cvKey });
    throw err;
  }
};
