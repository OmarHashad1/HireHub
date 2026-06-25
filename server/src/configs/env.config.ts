import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDir, `../../.env.${process.env.NODE_ENV ?? "development"}`),
});

export const APPLICATION_NAME = process.env.APPLICATION_NAME as string;

export const PORT = process.env.PORT as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;

export const SMTP_HOST = process.env.SMTP_HOST as string;
export const SMTP_USER = process.env.SMTP_USER as string;
export const SMTP_PASS = process.env.SMTP_PASS as string;
export const SMTP_PORT = process.env.SMTP_PORT as unknown as number;
export const SMTP_FROM = (process.env.SMTP_FROM ?? process.env.SMTP_USER) as string;

export const BREVO_API_KEY = process.env.BREVO_API_KEY as string;

export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
export const ENCRYPTION_IV_LENGTH = Number(process.env.ENCRYPTION_IV_LENGTH);
export const ENCRYPTION_ALGORITHM = process.env.ENCRYPTION_ALGORITHM as string;

export const REDIS_USERNAME = process.env.REDIS_USERNAME as string;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string;
export const REDIS_HOST = process.env.REDIS_HOST as string;
export const REDIS_PORT = process.env.REDIS_PORT as unknown as number;

export const USER_ACCESS_SECRET = process.env.USER_ACCESS_SECRET as string;
export const USER_REFRESH_SECRET = process.env.USER_REFRESH_SECRET as string;
export const ADMIN_ACCESS_SECRET = process.env.ADMIN_ACCESS_SECRET as string;
export const ADMIN_REFRESH_SECRET = process.env.ADMIN_REFRESH_SECRET as string;
export const COMPANY_ACCESS_SECRET = process.env
  .COMPANY_ACCESS_SECRET as string;
export const COMPANY_REFRESH_SECRET = process.env
  .COMPANY_REFRESH_SECRET as string;

export const CLIENT_URL = process.env.CLIENT_URL as string;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL as string;

export const AWS_REGION = process.env.AWS_REGION as string;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY = process.env
  .AWS_SECRET_ACCESS_KEY as string;
export const AWS_EXPIRATION = process.env.AWS_EXPIRATION as unknown as number;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
export const GEMINI_MODEL = process.env.GEMINI_MODEL as string;

export const FIREBASE_CREDENTIALS_PATH = process.env
  .FIREBASE_CREDENTIALS_PATH as string | undefined;
