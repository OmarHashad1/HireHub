import { initializeApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { redisService } from "../DB/RedisService.js";
import { Types } from "mongoose";
import { FIREBASE_CREDENTIALS_PATH } from "../configs/env.config.js";
import { serverLogger } from "./logger.util.js";

const currentDir = dirname(fileURLToPath(import.meta.url));

const credentialsPath = FIREBASE_CREDENTIALS_PATH
  ? resolve(FIREBASE_CREDENTIALS_PATH)
  : resolve(currentDir, "../../hirehub-9aa41-firebase-adminsdk-fbsvc-53c6a63519.json");

const serviceAccount = JSON.parse(
  readFileSync(credentialsPath, "utf8"),
) as ServiceAccount;

const client: App = initializeApp({
  credential: cert(serviceAccount),
});

export const sendNotification = async ({
  userId,
  data,
}: {
  userId: Types.ObjectId;
  data: {
    title: string;
    body: string;
  };
}) => {
  const token = (await redisService.getFCM(userId)) as string;
  if (!token) {
    return;
  }
  try {
    return await getMessaging(client).send({ token, data });
  } catch (error) {
    serverLogger.error({
      event: "notification.send.failed",
      userId: userId.toString(),
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }
};
