import { EventEmitter } from "node:events";
import { sendMail } from "../utils/smtp.util.js";

export const EMAIL_EVENTS = {
  WELCOME: "email.welcome",
  EMAIL_VERIFICATION: "email.verification",
  FORGOT_PASSWORD: "email.forgot-password",
  CHANGE_EMAIL: "email.change-email",
  DELETE_ACCOUNT: "email.delete-account",
  APPLICATION_RECEIVED: "email.application-received",
  APPLICATION_STATUS_UPDATE: "email.application-status-update",
  COMPANY_ACCOUNT_CREATED: "email.company-account-created",
  REPORT_RECEIVED: "email.report-received",
} as const;

export interface EmailEventPayloads {
  [EMAIL_EVENTS.WELCOME]: { to: string; firstName: string };
  [EMAIL_EVENTS.EMAIL_VERIFICATION]: { to: string; otp: string };
  [EMAIL_EVENTS.FORGOT_PASSWORD]: { to: string; otp: string };
  [EMAIL_EVENTS.CHANGE_EMAIL]: { to: string; otp: string };
  [EMAIL_EVENTS.DELETE_ACCOUNT]: { to: string; otp: string };
  [EMAIL_EVENTS.APPLICATION_RECEIVED]: { to: string };
  [EMAIL_EVENTS.APPLICATION_STATUS_UPDATE]: {
    to: string;
    status: string;
    rejectionReason?: string | undefined;
  };
  [EMAIL_EVENTS.COMPANY_ACCOUNT_CREATED]: {
    to: string;
    email: string;
    password: string;
  };
  [EMAIL_EVENTS.REPORT_RECEIVED]: { to: string; targetType: string };
}

class EmailEmitter extends EventEmitter {
  override emit<K extends keyof EmailEventPayloads>(
    event: K,
    payload: EmailEventPayloads[K],
  ): boolean {
    return super.emit(event, payload);
  }

  override on<K extends keyof EmailEventPayloads>(
    event: K,
    listener: (payload: EmailEventPayloads[K]) => void,
  ): this {
    return super.on(event, listener);
  }
}

export const emailEmitter = new EmailEmitter();

emailEmitter.on(EMAIL_EVENTS.WELCOME, async ({ to, firstName }) => {
  await sendMail({
    to,
    subject: "Welcome",
    html: `<h2> Welcome to HireHub ${firstName}! </h2>`,
  });
});

emailEmitter.on(EMAIL_EVENTS.EMAIL_VERIFICATION, async ({ to, otp }) => {
  await sendMail({
    to,
    subject: "Email Verification",
    html: `<h1>${otp}<h1>`,
  });
});

emailEmitter.on(EMAIL_EVENTS.FORGOT_PASSWORD, async ({ to, otp }) => {
  await sendMail({
    to,
    subject: "Forgot Password",
    html: `<h1>${otp}<h1>`,
  });
});

emailEmitter.on(EMAIL_EVENTS.CHANGE_EMAIL, async ({ to, otp }) => {
  await sendMail({ to, subject: "Change Email", html: otp });
});

emailEmitter.on(EMAIL_EVENTS.DELETE_ACCOUNT, async ({ to, otp }) => {
  await sendMail({ to, subject: "Delete Account", html: otp });
});

emailEmitter.on(EMAIL_EVENTS.APPLICATION_RECEIVED, async ({ to }) => {
  await sendMail({
    to,
    subject: "Application Received!",
    html: "<h1>Application Received</h1>",
  });
});

emailEmitter.on(
  EMAIL_EVENTS.APPLICATION_STATUS_UPDATE,
  async ({ to, status, rejectionReason }) => {
    await sendMail({
      to,
      subject: "Application Status update",
      html: `<h1>Application Status: ${status}<h1> <p>${rejectionReason}<p>`,
    });
  },
);

emailEmitter.on(
  EMAIL_EVENTS.COMPANY_ACCOUNT_CREATED,
  async ({ to, email, password }) => {
    await sendMail({
      to,
      subject: "Your HireHub Company Account",
      html: `Your credentials: email: ${email} password: ${password}`,
    });
  },
);

emailEmitter.on(EMAIL_EVENTS.REPORT_RECEIVED, async ({ to, targetType }) => {
  await sendMail({
    to,
    subject: "Report Received",
    html: `<h1>We received your report</h1><p>Your report against this ${targetType} has been submitted and is now pending review by our team.</p>`,
  });
});
