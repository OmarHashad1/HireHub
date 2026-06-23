import { EventEmitter } from "node:events";
import { Types } from "mongoose";
import { sendNotification } from "../utils/notification.util.js";
import { serverLogger } from "../utils/logger.util.js";

export const NOTIFICATION_EVENTS = {
  APPLICATION_STATUS_UPDATE: "notification.application-status-update",
  APPLICATION_RECEIVED: "notification.application-received",
  COMPANY_APPLICATION_DECISION: "notification.company-application-decision",
  INTERVIEW_SCHEDULED: "notification.interview-scheduled",
  INTERVIEW_RESCHEDULED: "notification.interview-rescheduled",

  INTERVIEW_CANCELLED: "notification.interview-cancelled",
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
  [NOTIFICATION_EVENTS.INTERVIEW_SCHEDULED]: {
    userId: Types.ObjectId;
    scheduledAt: Date;
  };
  [NOTIFICATION_EVENTS.INTERVIEW_CANCELLED]: {
    userId: Types.ObjectId;
    jobTitle: string;
  };
  [NOTIFICATION_EVENTS.INTERVIEW_RESCHEDULED]: {
    userId: Types.ObjectId;
    jobTitle: string;
    scheduledAt: Date;
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

notificationEmitter.on(
  NOTIFICATION_EVENTS.INTERVIEW_SCHEDULED,
  async ({ userId, scheduledAt }) => {
    const when = scheduledAt.toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Africa/Cairo",
    });
    await safeSend(
      userId,
      "Interview scheduled",
      `An interview has been scheduled for ${when}.`,
    );
  },
);

notificationEmitter.on(
  NOTIFICATION_EVENTS.INTERVIEW_CANCELLED,
  async ({ userId, jobTitle }) => {
    await safeSend(
      userId,
      "Interview Cancelled",
      `The interview for ${jobTitle} has been cancelled. Check your interviews section for details`,
    );
  },
);

notificationEmitter.on(
  NOTIFICATION_EVENTS.INTERVIEW_RESCHEDULED,
  async ({ userId, jobTitle, scheduledAt }) => {
    const when = scheduledAt.toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Africa/Cairo",
    });
    await safeSend(
      userId,
      "Interview Cancelled",
      `The interview for ${jobTitle} has been reschedules at ${when}. Check your interviews section for details`,
    );
  },
);
