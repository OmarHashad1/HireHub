import { BREVO_API_KEY, SMTP_FROM } from "../configs/env.config.js";
import { serverLogger } from "./logger.util.js";
import { emailDTO } from "../types/global.types.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const checkSMTP = async () => {
  if (!BREVO_API_KEY) {
    serverLogger.error("Email service: BREVO_API_KEY is not set");
    return;
  }
  serverLogger.info("Email service is ready (Brevo HTTP API)");
};

export const sendMail = async ({ to, subject, html }: emailDTO) => {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: SMTP_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      serverLogger.error(
        `Email Error: ${response.status} ${response.statusText} - ${body}`,
      );
      return;
    }

    serverLogger.info(
      `Email sent successfully to ${to} with subject: ${subject}`,
    );
  } catch (error) {
    serverLogger.error(`Email Error: ${error}`);
  }
};
