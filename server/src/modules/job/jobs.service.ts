import { JOB_STATUS } from "./../../enums/job.enums.js";
import { JobRepo } from "../../repositories/job.repo.js";
import { NotFoundException } from "../../utils/errorHandler.util.js";

const jobRepo = new JobRepo();
export const getPublishedJobs = async () => {
  return jobRepo.find({
    filter: { status: JOB_STATUS.PUBLISHED },
    options: { lean: true },
  });
};

export const getPublishedJob = async (jobId: string) => {
  const doc = jobRepo.findOne({
    filter: { status: JOB_STATUS.PUBLISHED, _id: jobId },
    options: { lean: true },
  });
  if (!doc) throw new NotFoundException("Job not found");

  return doc;
};
