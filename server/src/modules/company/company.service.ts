import { Types } from "mongoose";
import { CompanyApplicationRepo } from "../../repositories/companyApplication.repo.js";
import { ICompanyApplication } from "../../types/companyApplication.types.js";
import { encrypt } from "../../utils/encryption.util.js";
import { InternalServerErrorException } from "../../utils/errorHandler.util.js";
import { uploadAssets } from "../../utils/s3.util.js";

const applicationRepo = new CompanyApplicationRepo();

export const companyApplication = async (
  application: ICompanyApplication,
  files: Record<string, Express.Multer.File[]>,
) => {
  let filesArray = [...Object.values(files)].flat(3);
  const _id = new Types.ObjectId();
  const filesLinks = await uploadAssets({
    files: filesArray as unknown as Express.Multer.File[],
    path: `company/${_id}`,
  });

  const payload = await applicationRepo.create({
    data: {
      _id,
      companyName: application.companyName,
      companyEmail: application.companyEmail,
      phone: encrypt(application.phone),
      website: application.website,
      industry: application.industry,
      size: application.size,
      location: application.location,
      description: application.description,
      documents: {
        commercialRegistration: filesLinks["commercialRegistration"],
        taxCard: filesLinks["taxCard"],
      },
      linkedin: application.linkedin,
    },
  });
  if (!payload) throw new InternalServerErrorException();
  return payload;
};
