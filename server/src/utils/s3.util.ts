import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../configs/env.config.js";
import { IS3UploadAsset, IS3UploadAssets } from "../types/global.types.js";
import { randomUUID } from "node:crypto";
import { InternalServerErrorException } from "./errorHandler.util.js";
import { multerStorageType } from "../enums/multer.enums.js";
import { createReadStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const client: S3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const getPresignedURL = async ({
  command,
  expiresIn,
}: {
  command: PutObjectCommand;
  expiresIn: { expiresIn: number };
}) => {
  return await getSignedUrl(client, command, expiresIn);
};

export const uploadAsset = async ({
  storageStrategy = multerStorageType.MEM,
  Bucket = AWS_BUCKET_NAME,
  path,
  file,
  ACL,
  contentType,
}: IS3UploadAsset): Promise<string> => {
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

export const uploadAssets = async ({
  files,
  path = "/company/global",
}: IS3UploadAssets) => {
  const filesLinks: Record<string, string> = {
    taxCard: "",
    commercialRegistration: "",
  };

  await Promise.all(
    files.map(async (file) => {
      const link = await uploadAsset({
        storageStrategy: multerStorageType.DESK,
        file,
        path,
      });
      filesLinks[file.fieldname as keyof typeof filesLinks] = link;
    }),
  );

  return filesLinks;
};

export const getAsset = async ({
  Bucket = AWS_BUCKET_NAME,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({ Bucket, Key });
  return await getPresignedURL({ command, expiresIn: { expiresIn: 130 } });
};

export const deleteAsset = async ({
  Bucket = AWS_BUCKET_NAME,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new DeleteObjectCommand({ Bucket, Key });
  return await client.send(command);
};

export const deleteAssets = async (Keys: string[]) => {
  await Promise.all(
    Keys.map((Key) => {
      return deleteAsset({ Key });
    }),
  );
};

export const assetExists = async ({
  Key,
  Bucket = AWS_BUCKET_NAME,
}: {
  Key: string;
  Bucket?: string;
}): Promise<boolean> => {
  try {
    await client.send(new HeadObjectCommand({ Bucket, Key }));
    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === "NotFound" || err.name === "NoSuchKey")
    )
      return false;
    throw err;
  }
};

export const copyAsset = async ({
  sourceKey,
  destKey,
  Bucket = AWS_BUCKET_NAME,
}: {
  sourceKey: string;
  destKey: string;
  Bucket?: string;
}) => {
  const command = new CopyObjectCommand({
    Bucket,
    CopySource: `${Bucket}/${sourceKey.split("/").map(encodeURIComponent).join("/")}`,
    Key: destKey,
  });
  await client.send(command);
  return destKey;
};


