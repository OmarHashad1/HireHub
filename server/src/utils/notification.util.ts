import { initializeApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { redisService } from "../DB/RedisService.js";
import { Types } from "mongoose";

const serviceAccount = JSON.parse(
  readFileSync(
    resolve("./hirehub-9aa41-firebase-adminsdk-fbsvc-53c6a63519.json"),
    "utf8",
  ),
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
  const message = {
    token,
    data,
  };
  return await getMessaging(client).send(message);
};
