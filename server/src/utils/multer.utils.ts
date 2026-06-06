import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { uploadOpts } from "../types/global.types.js";
import { BadRequestException } from "../utils/errorHandler.util.js";

export const cloudUpload = (opts: uploadOpts) => {
  const { maxSizeMB = 5, allowedMimTypes, buildFileName } = opts;

  const storage = multer.diskStorage({
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
      const ext = file.originalname.split(".").at(-1);
      callback(null, `${buildFileName(req, file)}.${ext}`);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (allowedMimTypes && !allowedMimTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `File type ${file.mimetype} is not allowed, only  is supported`,
        ),
      );
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
    `cv__${req.user?._id}__${req.user?.fullName}__${file.originalname}____${randomUUID()}`,
});

export const avatarUpload = cloudUpload({
  maxSizeMB: 2,
  allowedMimTypes: ["image/jpeg", "image/png", "image/webp"],
  buildFileName: (req, file) =>
    `avatar__${req.user?._id}}__${req.user?.fullName}__${file.originalname}__${randomUUID()}`,
});

export const companyApplicationDocUpload = cloudUpload({
  maxSizeMB: 10,
  allowedMimTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  buildFileName: (req, file) =>
    `company__application__${req.body.companyName}___${file.fieldname}__${randomUUID()}`,
});
