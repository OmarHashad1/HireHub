import { JOB_STATUS } from "../../enums/job.enums.js";
import { JobRepo } from "../../repositories/job.repo.js";
import { SavedJobRepo } from "../../repositories/savedJob.repo.js";
import { IUser } from "../../types/user.types.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";

const jobRepo = new JobRepo();
const savedJobRepo = new SavedJobRepo();

export const saveJob = async (user: IUser, jobId: string) => {
  const job = await jobRepo.findOne({
    filter: { _id: jobId },
    options: { lean: true },
    projection: { _id: 1, status: 1 },
  });

  if (!job) throw new NotFoundException("Job not found");
  if (job.status !== JOB_STATUS.PUBLISHED)
    throw new BadRequestException("Only published jobs can be saved");

  const savedJob = await savedJobRepo.findOne({
    filter: { user: user._id, job: job._id },
    options: { lean: true },
  });

  if (savedJob) throw new ConflictException("Job already saved");

  return await savedJobRepo.create({
    data: {
      job: job._id,
      user: user._id,
    },
  });
};

export const deleteSavedJob = async (user: IUser, jobId: string) => {
  const result = await savedJobRepo.deleteOne({
    filter: { user: user._id, job: jobId },
  });
  if (!result.deletedCount) throw new NotFoundException("Saved Job not found");
  return result;
};

export const getAllSavedJobs = async (user: IUser) => {
  const payload = await savedJobRepo.find({
    filter: { user: user._id },
    options: {
      lean: true,
      populate: { path: "job", select: { aiThreshold: 0, } },
    },
    projection: { job: 1 },
  });

  return payload;
};
