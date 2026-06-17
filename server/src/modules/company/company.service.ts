import { COMPANY_APPLICATION_STATUS } from "./../../enums/companyApplication.enums.js";
import { Types, UpdateQuery } from "mongoose";
import { CompanyApplicationRepo } from "../../repositories/companyApplication.repo.js";
import { ICompanyApplication } from "../../types/companyApplication.types.js";
import { encrypt } from "../../utils/encryption.util.js";
import {
  ConflictException,
  ForbiddenExceptions,
  InternalServerErrorException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { deleteAssets, uploadAssets } from "../../utils/s3.util.js";
import { IUser } from "../../types/user.types.js";
import { CompanyRepo } from "../../repositories/company.repo.js";
import { COMPANY_STATUS } from "../../enums/company.enums.js";
import {
  updateCompanyApplicationStatusDTO,
  updateCompanyProfileDTO,
} from "../../schemas/company.schema.js";
import { sendMail } from "../../utils/smtp.util.js";
import { generatePassword } from "../../utils/generatePasssword.util.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { ROLE } from "../../enums/user.enums.js";

const applicationRepo = new CompanyApplicationRepo();
const companyRepo = new CompanyRepo();
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

  return await companyRepo.updateOne({
    filter: { _id: company._id, owner: user._id },
    update,
  });
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
  const submitter = await userRepo.findOne({
    filter: { _id: application.submittedBy },
    options: { lean: true },
  });
  if (!submitter) {
    await applicationRepo.deleteOne({ filter: { _id: application._id } });
    throw new NotFoundException("Submitter account no longer exists");
  }
  if (dto.status === COMPANY_APPLICATION_STATUS.REJECTED) {
    application.status = COMPANY_APPLICATION_STATUS.REJECTED;
    application.rejectionReason = dto.rerejectionReason as string;
    await application.save();
    return await sendMail({
      to: application.companyEmail,
      subject: "Application Status update",
      html: `<h1>Application Status: ${dto.status}<h1>`,
    });
  } else {
    const tempPassword = generatePassword();

    const recruiter = await userRepo.create({
      data: {
        firstName: submitter.firstName,
        lastName: submitter.lastName,
        email: application.companyEmail,
        password: tempPassword,
        phoneNumber: application.contactPhone,
        role: ROLE.COMPANY,
        isEmailVerified: true,
      },
    });
    await companyRepo.create({
      data: {
        owner: recruiter._id,
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
    });
    await applicationRepo.updateOne({
      filter: { _id: application._id },
      update: {
        status: COMPANY_APPLICATION_STATUS.APPROVED,
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
    });
    await sendMail({
      to: application.companyEmail,
      subject: "Your HireHub Company Account",
      html: `Your credentials: email: ${application.companyEmail} password: ${tempPassword}`,
    });
  }
};
