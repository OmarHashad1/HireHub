import { Types } from "mongoose";
import { APPLICATION_STATUS } from "../../enums/application.enums.js";
import { JOB_STATUS } from "../../enums/job.enums.js";
import { ROLE } from "../../enums/user.enums.js";
import { ApplicationRepo } from "../../repositories/application.repo.js";
import { JobRepo } from "../../repositories/job.repo.js";
import {
  createApplicationDTO,
  updateApplicationDTO,
} from "../../schemas/application.schema.js";
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
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { emailEmitter, EMAIL_EVENTS } from "../../events/email.events.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";

const applicationRepo = new ApplicationRepo();
const jobRepo = new JobRepo();
const companyRepo = new CompanyRepo();
export const getUserApplications = async (
  user: IUser,
  { page, size }: paginationQueryDTO,
) => {
  const payload = await applicationRepo.paginate({
    filter: {
      applicant: user._id,
    },
    options: {
      lean: true,
    },
    page,
    size,
  });

  return payload;
};

export const getSingleApplication = async (
  user: IUser,
  applicationId: string,
) => {
  const application = await applicationRepo.findOne({
    filter: { _id: applicationId },
    options: { lean: true, populate: { path: "job", select: { company: 1 } } },
  });
  if (!application)
    throw new NotFoundException(
      "Application not found. It may have been removed or the id is incorrect.",
    );

  if (user.role == ROLE.USER && !application.applicant.equals(user._id))
    throw new ForbiddenExceptions(
      "You do not have permission to access this application. You can only view your own applications.",
    );

  if (user.role == ROLE.COMPANY) {
    const company = await companyRepo.findOne({
      filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
      options: { lean: true },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }
    if (
      !(
        application.job as unknown as { company: Types.ObjectId }
      ).company.equals(company._id)
    ) {
      throw new ForbiddenExceptions(
        "You do not have permission to access this application. You can only view applications for your own company's jobs.",
      );
    }
  }

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
  const withdrawn = await application.save();

  activityLogger.info({
    event: "application.withdrawn",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.WITHDRAW_APPLICATION,
    targetType: LOG_TARGET_TYPE.APPLICATION,
    targetId: application._id,
  });

  return withdrawn;
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

    activityLogger.info({
      event: "application.created",
      actor: user._id,
      email: user.email,
      action: LOG_ACTION.CREATE_APPLICATION,
      targetType: LOG_TARGET_TYPE.APPLICATION,
      targetId: application._id,
    });

    emailEmitter.emit(EMAIL_EVENTS.APPLICATION_RECEIVED, { to: user.email });

    return application;
  } catch (err) {
    await deleteAsset({ Key: cvKey });
    throw err;
  }
};

export const getJobApplications = async (
  user: IUser,
  jobId: string,
  dto: paginationQueryDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    options: { lean: true },
  });

  if (!company) {
    throw new NotFoundException("Company not found");
  }

  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: { lean: true },
  });
  if (!job) {
    throw new NotFoundException("Jobƒ not found");
  }

  const payload = await applicationRepo.paginate({
    filter: { job: jobId },
    options: { lean: true },
    page: dto.page,
    size: dto.size,
  });

  return payload;
};

export const updateApplication = async (
  user: IUser,
  applicationId: string,
  dto: updateApplicationDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    options: { lean: true },
  });

  if (!company) {
    throw new NotFoundException(
      "No active company is linked to your account, so you cannot update applications",
    );
  }

  const application = await applicationRepo.findOne({
    filter: { _id: applicationId },
    options: {
      lean: true,
      populate: { path: "job", select: { company: 1 } },
    },
  });

  if (!application) throw new NotFoundException("Application not found");
  if (application.status === APPLICATION_STATUS.WITHDRAWN)
    throw new ConflictException(
      "This application has been withdrawn by the applicant and can no longer be updated",
    );
  if (
    !(application.job as unknown as { company: Types.ObjectId }).company.equals(
      company._id,
    )
  ) {
    throw new ForbiddenExceptions(
      "You cannot update an application for a job that belongs to another company",
    );
  }
  if (dto.status) {
    const reqiredStatus: Partial<
      Record<APPLICATION_STATUS, APPLICATION_STATUS>
    > = {
      [APPLICATION_STATUS.OFFER]: APPLICATION_STATUS.INTERVIEW,
      [APPLICATION_STATUS.REJECTED]: APPLICATION_STATUS.APPLIED,
      [APPLICATION_STATUS.INTERVIEW]: APPLICATION_STATUS.APPLIED,
      [APPLICATION_STATUS.REVIEWED]: APPLICATION_STATUS.APPLIED,
    };

    if (application.status !== reqiredStatus[dto.status]) {
      throw new BadRequestException(
        `Cannot change application status from "${application.status}" to "${dto.status}". A "${dto.status}" status requires the application to currently be "${reqiredStatus[dto.status]}"`,
      );
    }
    if (dto.status === APPLICATION_STATUS.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException(
        "A rejection reason is required when rejecting an application",
      );
    }
    await applicationRepo.updateOne({
      filter: {
        _id: application._id,
      },
      update: {
        status: dto.status,
        ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
        ...(dto.recruiterNotes && {
          recruiterNotes: dto.recruiterNotes,
        }),
      },
    });
  } else {
    await applicationRepo.updateOne({
      filter: {
        _id: application._id,
      },
      update: { recruiterNotes: dto.recruiterNotes },
    });
  }
};

/*
offer->interview
rejected->applied
applied->interview
applied->inteview
*/
