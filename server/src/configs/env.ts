import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve(`./.env.${process.env.NODE_ENV&&"development"}`),
});

export const PORT = process.env.PORT as string;
