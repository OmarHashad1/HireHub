import { JOB_STATUS } from "../enums/job.enums.js";
import { jobModel } from "../models/index.js";
import { serverLogger } from "../utils/logger.util.js";
import cron from "node-cron";

const expireStaleJobs = async () => {
  try {
    const result = await jobModel.updateMany(
      {
        status: JOB_STATUS.PUBLISHED,
        deadline: { $ne: null, $lt: new Date() },
      },
      { status: JOB_STATUS.EXPIRED },
    );
    if (result.modifiedCount > 0)
      serverLogger.info(`Expired ${result.modifiedCount} jobs`);
  } catch (err) {
    serverLogger.error(err, "expireStaleJobs cron failed");
  }
};

cron.schedule("0 23 * * *", expireStaleJobs, {
  name: "expire-stale-jobs",
  timezone: "Africa/Cairo",
});
