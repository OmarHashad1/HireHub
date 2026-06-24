import { INTERVIEW_STATUS } from "../enums/interview.enums.js";
import { interviewModel } from "../models/interview.model.js";
import { serverLogger } from "../utils/logger.util.js";
import cron from "node-cron";

const expireStaleInterviews = async () => {
  try {
    const result = await interviewModel.updateMany(
      {
        status: INTERVIEW_STATUS.SCHEDULED,
        scheduledAt: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      },
      { status: INTERVIEW_STATUS.MISSED },
    );
    if (result.modifiedCount > 0)
      serverLogger.info(
        `Changed ${result.modifiedCount} interviews to ${INTERVIEW_STATUS.MISSED}`,
      );
  } catch (err) {
    serverLogger.error(err, "expireStaleInterviews cron failed");
  }
};

cron.schedule("0 23 * * *", expireStaleInterviews, {
  name: "miss-stale-interviews",
  timezone: "Africa/Cairo",
});
