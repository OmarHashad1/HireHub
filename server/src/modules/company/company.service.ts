import { COMPANY_APPLICATION_STATUS } from "./../../enums/companyApplication.enums.js";
import { Types, UpdateQuery } from "mongoose";
import { CompanyApplicationRepo } from "../../repositories/companyApplication.repo.js";
import { ICompanyApplication } from "../../types/companyApplication.types.js";
import { encrypt } from "../../utils/encryption.util.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenExceptions,
  InternalServerErrorException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import {
  deleteAsset,
  deleteAssets,
  uploadAsset,
  uploadAssets,
} from "../../utils/s3.util.js";
import { multerStorageType } from "../../enums/multer.enums.js";
import { IUser } from "../../types/user.types.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import {
  getCompanyJobsDTO,
  updateCompanyProfileDTO,
} from "../../schemas/company.schema.js";

import { UserRepo } from "../../repositories/user.repo.js";
import { ROLE } from "../../enums/user.enums.js";
import { JobRepo } from "../../repositories/job.repo.js";
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";

const applicationRepo = new CompanyApplicationRepo();
const companyRepo = new CompanyRepo();
const jobRepo = new JobRepo();
const userRepo = new UserRepo();
export const companyApplication = async (
  user: IUser,
  application: ICompanyApplication,
  files: Record<string, Express.Multer.File[]>,
) => {
  const emailUsedByUser = await userRepo.findOne({
    filter: { email: application.companyEmail },
    options: { lean: true },
  });
  if (emailUsedByUser)
    throw new ConflictException(
      "This email is already registered as a user account",
    );

  const emailUsedByApplication = await applicationRepo.findOne({
    filter: {
      companyEmail: application.companyEmail,
      status: {
        $in: [
          COMPANY_APPLICATION_STATUS.PENDING,
          COMPANY_APPLICATION_STATUS.APPROVED,
        ],
      },
    },
    options: { lean: true },
  });
  if (emailUsedByApplication)
    throw new ConflictException(
      "A company application with this email already exists",
    );

  const applicationPedning = await applicationRepo.findOne({
    filter: {
      submittedBy: user._id,
      status: {
        $in: [
          COMPANY_APPLICATION_STATUS.PENDING,
          COMPANY_APPLICATION_STATUS.APPROVED,
        ],
      },
    },
    options: {
      lean: true,
    },
  });

  if (applicationPedning) {
    throw new ForbiddenExceptions(
      "A company application is under review or has been approved under user account",
    );
  }

  let filesArray = [...Object.values(files)].flat(3);
  const _id = new Types.ObjectId();
  const filesLinks = await uploadAssets({
    files: filesArray as unknown as Express.Multer.File[],
    path: `company/${_id}`,
  });

  const payload = await applicationRepo.create({
    data: {
      _id,
      submittedBy: user._id,
      companyName: application.companyName,
      companyEmail: application.companyEmail,
      website: application.website,
      industry: application.industry,
      size: application.size,
      location: application.location,
      description: application.description,
      documents: {
        commercialRegistration: filesLinks["commercialRegistration"],
        taxCard: filesLinks["taxCard"],
      },
      contactPhone: encrypt(application.contactPhone),
      linkedin: application.linkedin,
      foundedAt: application.foundedAt ?? null,
    },
  });
  if (!payload) {
    await deleteAssets(Array.from(Object.values(filesLinks)));
    throw new InternalServerErrorException();
  }

  activityLogger.info({
    event: "company.application.submitted",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.SUBMIT_COMPANY_APPLICATION,
    targetType: LOG_TARGET_TYPE.COMPANY_APPLICATION,
    targetId: payload._id,
  });

  return payload;
};

export const companyProfile = async (user: IUser) => {
  const payload = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    options: {
      lean: true,
      populate: {
        path: "owner",
        select: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          avatar: 1,
          headline: 1,
          socialMedia: 1,
          bio: 1,
        },
      },
    },
  });

  if (!payload) throw new NotFoundException("Company Not Found");
  return payload;
};

export const getPublicCompany = async (id: string) => {
  const company = await companyRepo.findOne({
    filter: { _id: id, status: COMPANY_STATUS.ACTIVE },
    projection: {
      name: 1,
      logo: 1,
      coverImage: 1,
      industry: 1,
      size: 1,
      location: 1,
      description: 1,
      website: 1,
      benefits: 1,
      socialMedia: 1,
      foundedAt: 1,
      email: 1,
      createdAt: 1,
    },
    options: { lean: true },
  });

  if (!company) throw new NotFoundException("Company not found");
  return company;
};

export const changeCompanyLogo = async (
  user: IUser,
  file: Express.Multer.File,
) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    projection: { _id: 1, logo: 1 },
    options: { lean: true },
  });
  if (!company) throw new NotFoundException("Company not found");

  if (company.logo) {
    await deleteAsset({ Key: company.logo });
  }

  const bucketKey = await uploadAsset({
    path: `company/logo/${company._id}`,
    file,
    storageStrategy: multerStorageType.DESK,
  });

  await companyRepo.updateOne({
    filter: { _id: company._id },
    update: { logo: bucketKey },
  });

  return { logo: bucketKey };
};

export const deleteCompanyLogo = async (user: IUser) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    projection: { _id: 1, logo: 1 },
    options: { lean: true },
  });
  if (!company) throw new NotFoundException("Company not found");
  if (!company.logo) throw new BadRequestException("No company logo to delete");

  await deleteAsset({ Key: company.logo });
  await companyRepo.updateOne({
    filter: { _id: company._id },
    update: { $unset: { logo: 1 } },
  });
};

export const updateCompanyProfile = async (
  user: IUser,
  dto: updateCompanyProfileDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { owner: user._id, status: COMPANY_STATUS.ACTIVE },
    options: {
      lean: true,
    },
  });
  if (!company) throw new NotFoundException("Company Not Found");
  const { socialMedia, location, ...rest } = dto;
  const update: UpdateQuery<IUser> = { ...rest };
  if (socialMedia) {
    for (const [key, value] of Object.entries(socialMedia)) {
      update[`socialMedia.${key}`] = value;
    }
  }
  if (location) {
    for (const [key, value] of Object.entries(location)) {
      update[`location.${key}`] = value;
    }
  }

  const result = await companyRepo.updateOne({
    filter: { _id: company._id, owner: user._id },
    update,
  });

  activityLogger.info({
    event: "company.profile.updated",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.UPDATE_COMPANY_PROFILE,
    targetType: LOG_TARGET_TYPE.COMPANY,
    targetId: company._id,
  });

  return result;
};

export const getCompanyJobs = async (
  user: IUser,
  { companyId }: getCompanyJobsDTO,
  { page, size }: paginationQueryDTO,
) => {
  const company = await companyRepo.findOne({
    filter: { _id: companyId },
    options: { lean: true },
    projection: { _id: 1, name: 1, status: 1, owner: 1 },
  });

  if (!company) throw new NotFoundException("Company Not found");
  if (user.role === ROLE.COMPANY && !company.owner.equals(user._id)) {
    throw new ForbiddenExceptions(
      "You are not authorized to access this company jobs",
    );
  }

  const payload = await jobRepo.paginate({
    filter: { company: company._id },
    options: { lean: true },
    page,
    size,
  });
  return payload;
};
