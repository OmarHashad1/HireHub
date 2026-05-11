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
