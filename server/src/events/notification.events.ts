import { EventEmitter } from "node:events";
import { Types } from "mongoose";
import { sendNotification } from "../utils/notification.util.js";
import { serverLogger } from "../utils/logger.util.js";

export const NOTIFICATION_EVENTS = {
  APPLICATION_STATUS_UPDATE: "notification.application-status-update",
  APPLICATION_RECEIVED: "notification.application-received",
  COMPANY_APPLICATION_DECISION: "notification.company-application-decision",
} as const;

export interface NotificationEventPayloads {
  [NOTIFICATION_EVENTS.APPLICATION_STATUS_UPDATE]: {
    userId: Types.ObjectId;
    status: string;
  };
  [NOTIFICATION_EVENTS.APPLICATION_RECEIVED]: {
    userId: Types.ObjectId;
    jobTitle: string;
  };
  [NOTIFICATION_EVENTS.COMPANY_APPLICATION_DECISION]: {
    userId: Types.ObjectId;
    status: string;
  };
}

class NotificationEmitter extends EventEmitter {
  override emit<K extends keyof NotificationEventPayloads>(
    event: K,
    payload: NotificationEventPayloads[K],
  ): boolean {
    return super.emit(event, payload);
  }

  override on<K extends keyof NotificationEventPayloads>(
    event: K,
    listener: (payload: NotificationEventPayloads[K]) => void,
  ): this {
    return super.on(event, listener);
  }
}

export const notificationEmitter = new NotificationEmitter();

// A missing FCM token (user not registered for push) makes sendNotification
// throw — swallow it here so a failed push never breaks the request that
// emitted it. Real delivery failures are logged for visibility.
const safeSend = async (
  userId: Types.ObjectId,
  title: string,
  body: string,
) => {
  try {
    await sendNotification({ userId, data: { title, body } });
  } catch (err) {
    serverLogger.error({ err, userId: userId.toString() }, "FCM send failed");
  }
};

notificationEmitter.on(
  NOTIFICATION_EVENTS.APPLICATION_STATUS_UPDATE,
  async ({ userId, status }) => {
    await safeSend(
      userId,
      "Application update",
      `Your application status changed to "${status}".`,
    );
  },
);

notificationEmitter.on(
  NOTIFICATION_EVENTS.APPLICATION_RECEIVED,
  async ({ userId, jobTitle }) => {
    await safeSend(
      userId,
      "New application",
      `You received a new application for "${jobTitle}".`,
    );
  },
);

notificationEmitter.on(
  NOTIFICATION_EVENTS.COMPANY_APPLICATION_DECISION,
  async ({ userId, status }) => {
    await safeSend(
      userId,
      "Company application update",
      `Your company application was ${status}.`,
    );
  },
);
