import { JOB_STATUS } from "../../enums/job.enums.js";
import { JobRepo } from "../../repositories/job.repo.js";
import { SavedJobRepo } from "../../repositories/savedJob.repo.js";
import { IUser } from "../../types/user.types.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/errorHandler.util.js";
import { activityLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";

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

  const created = await savedJobRepo.create({
    data: {
      job: job._id,
      user: user._id,
    },
  });

  activityLogger.info({
    event: "savedJob.saved",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.SAVE_JOB,
    targetType: LOG_TARGET_TYPE.JOB,
    targetId: job._id,
  });

  return created;
};

export const deleteSavedJob = async (user: IUser, jobId: string) => {
  const result = await savedJobRepo.deleteOne({
    filter: { user: user._id, job: jobId },
  });
  if (!result.deletedCount) throw new NotFoundException("Saved Job not found");

  activityLogger.info({
    event: "savedJob.removed",
    actor: user._id,
    email: user.email,
    action: LOG_ACTION.UNSAVE_JOB,
    targetType: LOG_TARGET_TYPE.JOB,
    targetId: jobId,
  });

  return result;
};

export const getAllSavedJobs = async (
  user: IUser,
  { page, size }: paginationQueryDTO,
) => {
  const payload = await savedJobRepo.paginate({
    filter: { user: user._id },
    options: {
      lean: true,
      populate: { path: "job", select: { aiThreshold: 0 } },
    },
    projection: { job: 1 },
    page,
    size,
  });

  return payload;
};
