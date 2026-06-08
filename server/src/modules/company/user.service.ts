import { CompanyApplicationRepo } from "../../repositories/companyApplication.repo.js";
import { ICompanyApplication } from "../../types/companyApplication.types.js";
import { encrypt } from "../../utils/encryption.util.js";
import { InternalServerErrorException } from "../../utils/errorHandler.util.js";

const applicationRepo = new CompanyApplicationRepo();

export const companyApplication = async (application: ICompanyApplication) => {
  const payload = await applicationRepo.create({
    data: {
      companyName: application.companyName,
      companyEmail: application.companyEmail,
      phone: encrypt(application.phone),
      website: application.website,
      industry: application.industry,
      size: application.size,
      location: application.location,
      description: application.description,
      documents: {
        commercialRegistration: application.documents.commercialRegistration,
        taxCard: application.documents.taxCard,
      },
      linkedin: application.linkedin,
    },
  });
  if (!payload) throw new InternalServerErrorException();

  return payload;
};
