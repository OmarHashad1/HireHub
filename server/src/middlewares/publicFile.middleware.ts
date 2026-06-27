import { NextFunction, Request, Response } from "express";
import { APPLICATION_NAME } from "../configs/env.config.js";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/errorHandler.util.js";
import { Types } from "mongoose";
import { CompanyRepo } from "../repositories/company.repo.js";
import { successRes } from "../utils/response.util.js";
import { getAsset } from "../utils/s3.util.js";
import { StatusCodes } from "http-status-codes";

const companyRepo = new CompanyRepo();
export const PublicfilesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { path } = req.params as { path: string[] };

    if (!path || path[0] != APPLICATION_NAME)
      throw new BadRequestException("Invalid file path");

    let ownedKey: string | null | undefined;

    if (path[1] == "company" && path[2] == "logo") {
      const companyId = path[3] as unknown as Types.ObjectId;

      const company = await companyRepo.findOne({
        filter: { _id: companyId },
        options: { lean: true },
        projection: { logo: 1 },
      });

      if (!company) throw new NotFoundException("Requested file not found");
      ownedKey = company.logo;
    } else {
      throw new BadRequestException("Unsupported file type requested");
    }

    const Key = path.join("/");
    if (Key !== ownedKey)
      throw new BadRequestException("Requested file not found");

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
