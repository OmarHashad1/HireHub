import { createTransport } from "nodemailer";
import {
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_USER,
} from "../configs/env.config.js";
import { serverLogger } from "./logger.util.js";
import { emailDTO } from "../types/global.types.js";

export const transporter = createTransport({
  port: SMTP_PORT,
  service: SMTP_SERVICE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const checkSMTP = async () => {
  try {
    await transporter.verify();
    serverLogger.info("SMTP service is ready");
  } catch (error) {
    serverLogger.error(`SMTP Service Error: ${error}`);
  }
};

export const sendMail = async ({ to, subject, html }: emailDTO) => {
  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to,
      html,
      subject,
    });
    serverLogger.info(`Email sent successfully to ${to} with subject: ${subject}`);
  } catch (error) {
    serverLogger.error(`SMTP Error: ${error}`);
  }
};
