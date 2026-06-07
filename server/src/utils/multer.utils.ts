import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { tmpdir } from "node:os";
import { uploadOpts } from "../types/global.types.js";
import { BadRequestException } from "../utils/errorHandler.util.js";
import { multerStorageType } from "../enums/multer.enums.js";

export const cloudUpload = (
  opts: uploadOpts,
  storageTYPE: multerStorageType = multerStorageType.MEM,
) => {
  const { maxSizeMB = 5, allowedMimTypes, buildFileName } = opts;

  const storage =
    storageTYPE === multerStorageType.MEM
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination(
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            callback(null, tmpdir());
          },
          filename(
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            callback(null, `${buildFileName(req, file)}`);
          },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (allowedMimTypes && !allowedMimTypes.includes(file.mimetype)) {
      return callback(new BadRequestException(`File type is not allowed`));
    }
    callback(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
};

export const uploadCV = cloudUpload({
  maxSizeMB: 2,
  allowedMimTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  buildFileName: (req, file) =>
    `${req.user?._id}__${req.user?.fullName}__${file.originalname}}`,
});

export const uploadAvatar = cloudUpload({
  maxSizeMB: 2,
  allowedMimTypes: ["image/jpeg", "image/png", "image/webp"],
  buildFileName: (req, file) =>
    `${req.user?._id}__${req.user?.firstName}-${req.user?.lastName}__${file.originalname}}`,
},multerStorageType.DESK);

export const uploadCompanyApplicationDoc = cloudUpload(
  {
    maxSizeMB: 10,
    allowedMimTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    buildFileName: (req, file) =>
      `company__application__${file.fieldname}_)${req.body.companyName}}`,
  },
  multerStorageType.DESK,
);
