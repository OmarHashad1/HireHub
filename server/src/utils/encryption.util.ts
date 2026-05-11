import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  ENCRYPTION_SECRET,
  ENCRYPTION_IV_LENGTH,
  ENCRYPTION_ALGORITHM,
} from "../configs/env.js";

const KEY = Buffer.from(ENCRYPTION_SECRET, "hex");

export const encrypt = (text: string): string => {
  const iv = randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (payload: string): string => {
  const [ivHex, encryptedHex] = payload.split(":");
  const iv = Buffer.from(ivHex!, "hex");
  const encrypted = Buffer.from(encryptedHex!, "hex");
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
};
