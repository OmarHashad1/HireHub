import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve(`./.env.${process.env.NODE_ENV && "development"}`),
});

export const PORT = process.env.PORT as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;

export const SMTP_USER = process.env.SMTP_USER as string;
export const SMTP_PASS = process.env.SMTP_PASS as string;
export const SMTP_PORT = process.env.SMTP_PORT as unknown as number;
export const SMTP_SERVICE = process.env.SMTP_SERVICE as string;

export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
export const ENCRYPTION_IV_LENGTH = Number(process.env.ENCRYPTION_IV_LENGTH);
export const ENCRYPTION_ALGORITHM = process.env.ENCRYPTION_ALGORITHM as string;

export const REDIS_USERNAME = process.env.REDIS_USERNAME as string;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string;
export const REDIS_HOST = process.env.REDIS_HOST as string;
export const REDIS_PORT = process.env.REDIS_PORT as unknown as number;

export const USER_ACCESS_SECRET =process.env.USER_ACCESS_SECRET as string
export const USER_REFRESH_SECRET =process.env.USER_REFRESH_SECRET as string
export const ADMIN_ACCESS_SECRET =process.env.ADMIN_ACCESS_SECRET as string
export const ADMIN_REFRESH_SECRET =process.env.ADMIN_REFRESH_SECRET as string
export const RECRUITER_ACCESS_SECRET =process.env.RECRUITER_ACCESS_SECRET as string
export const RECRUITER_REFRESH_SECRET =process.env.RECRUITER_REFRESH_SECRET as string