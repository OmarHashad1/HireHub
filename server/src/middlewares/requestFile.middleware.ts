import { StatusCodes } from "http-status-codes";
import { successRes } from "../utils/response.util.js";
import { getAsset } from "../utils/s3.util.js";
import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/errorHandler.util.js";
import { APPLICATION_NAME } from "../configs/env.config.js";
import { ROLE } from "../enums/user.enums.js";
import { CompanyApplicationRepo } from "../repositories/companyApplication.repo.js";
import { ICompanyApplicationDocuments } from "../types/companyApplication.types.js";
import { ApplicationRepo } from "../repositories/application.repo.js";
import { CompanyRepo } from "../repositories/company.repo.js";
import { Types } from "mongoose";

const companyApplicationRepo = new CompanyApplicationRepo();
const applicationRepo = new ApplicationRepo();
const companyRepo = new CompanyRepo();

export const requestFileMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required to access files");
    }
    const { path } = req.params as { path: string[] };
    if (!path || path[0] != APPLICATION_NAME) {
      throw new BadRequestException("Invalid file path");
    }
    let ownedKey: string | null | undefined;

    if (path.includes("avatar")) {
      if (req.user._id.toString() != path[2]) {
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );
      }
      ownedKey = req.user.avatar;
    } else if (path[1] === "application" && path[3] === "cv") {
     
      const applicationId = path[2];
      if (!applicationId) throw new BadRequestException("Invalid file path");

      const application = await applicationRepo.findOne({
        filter: { _id: applicationId },
        options: {
          lean: true,
          populate: {
            path: "job",
            select: { company: 1 },
            populate: { path: "company", select: { owner: 1 } },
          },
        },
      });
      if (!application)
        throw new NotFoundException("Requested file not found");

      const companyOwner = (
        application.job as unknown as { company: { owner: Types.ObjectId } }
      ).company.owner;

      const isAdmin = req.user.role === ROLE.ADMIN;
      const isApplicant = application.applicant.equals(req.user._id);
      const isCompanyOwner = companyOwner.equals(req.user._id);
      if (!isAdmin && !isApplicant && !isCompanyOwner)
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );

      ownedKey = application.cv;
    } else if (path.includes("cv")) {
      if (req.user._id.toString() != path[2]) {
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );
      }
      ownedKey = req.user.cv;
    } else if (
      path[3] === "commercialRegistration" ||
      path[3] === "taxCard"
    ) {
      if (req.user.role != ROLE.ADMIN)
        throw new UnauthorizedException(
          "You are not allowed to access this file",
        );

      const applicationId = path[2];
      if (!applicationId) throw new BadRequestException("Invalid file path");

      const application = await companyApplicationRepo.findOne({
        filter: { _id: applicationId },
        options: { lean: true },
      });
      if (!application)
        throw new NotFoundException("Requested file not found");

      ownedKey =
        application.documents[path[3] as keyof ICompanyApplicationDocuments];
    } else {
      throw new BadRequestException("Unsupported file type requested");
    }

    const Key = path.join("/");

    if (Key != ownedKey) {
      throw new BadRequestException("Requested file not found");
    }
    const requestedFile = await getAsset({ Key });
    return successRes({
      res,
      message: "Signed URL fetched Successfully",
      status: StatusCodes.OK,
      data: { requestedFile },
    });
  } catch (err) {
    next(err);
  }
};
