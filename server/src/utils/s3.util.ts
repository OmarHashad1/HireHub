import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {
  APPLICATION_NAME,
  AWS_ACCESSS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../configs/env.config.js";
import { IS3UploadAssets } from "../types/global.types.js";
import { randomUUID } from "node:crypto";
import { InternalServerErrorException } from "./errorHandler.util.js";
import { multerStorageType } from "../enums/multer.enums.js";
import { createReadStream } from "node:fs";

export const client: S3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESSS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadAsset = async ({
  storageStrategy = multerStorageType.MEM,
  Bucket = AWS_BUCKET_NAME,
  path,
  file,
  ACL,
  contentType,
}: IS3UploadAssets): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${APPLICATION_NAME}/${path}/${file.fieldname}/${file.filename ? file.filename : randomUUID() + `${file.originalname}`}`,
    ACL,
    Body:
      storageStrategy === multerStorageType.MEM
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype || contentType,
  });
  if (!command.input?.Key)
    throw new InternalServerErrorException("Failed to upload asset");

  await client.send(command);

  return command.input?.Key;
};
