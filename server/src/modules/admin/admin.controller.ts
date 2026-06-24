import { NextFunction, Request, Response } from "express";
import {
  getAllApplications,
  getAllCompanies,
  getAllCompanyApplications,
  getAllJobs,
  getAllReports,
  getAllUsers,
  getApplication,
  getCompany,
  getCompanyApplication,
  getJob,
  getLogs,
  getReport,
  getStats,
  getUser,
  updateCompanyApplicationStatus,
  updateCompanyStatus,
  updateJobStatus,
  updateReportStatus,
  updateUserStatus,
} from "./admin.service.js";
import { paginationQueryDTO } from "../../schemas/global.schema.js";
import { successRes } from "../../utils/response.util.js";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../../types/user.types.js";
import { updateCompanyApplicationStatusDTO } from "../../schemas/company.schema.js";
import {
  updateCompanyStatusDTO,
  updateJobStatusDTO,
  updateReportStatusDTO,
  updateUserStatusDTO,
} from "../../schemas/admin.schema.js";

export const updateCompanyApplicationStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateCompanyApplicationStatus(
      req.user as IUser,
      req.body as updateCompanyApplicationStatusDTO,
    );
    successRes({
      res,
      message: "Application status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllUsers(req.query as unknown as paginationQueryDTO);
    successRes({
      res,
      message: "Users data fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getUser(req.params.id as string);
    successRes({
      res,
      message: "User data fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCompanyApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllCompanyApplications(
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "Company applications fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getCompanyApplication(req.params.id as string);
    successRes({
      res,
      message: "Company application fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCompaniesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllCompanies(
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "Companies fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getCompany(req.params.id as string);
    successRes({
      res,
      message: "Company fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCompanyStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateCompanyStatus(
      req.user as IUser,
      req.body as updateCompanyStatusDTO,
      req.params.id as string,
    );
    successRes({
      res,
      message: "Company status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllJobs(req.query as unknown as paginationQueryDTO);
    successRes({
      res,
      message: "Jobs fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllApplications(
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "Applications fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getApplication(req.params.id as string);
    successRes({
      res,
      message: "Application fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getJob(req.params.id as string);
    successRes({
      res,
      message: "Job fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateJobStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateJobStatus(
      req.user as IUser,
      req.body as updateJobStatusDTO,
      req.params.id as string,
    );
    successRes({
      res,
      message: "Job status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllReports(
      req.query as unknown as paginationQueryDTO,
    );
    successRes({
      res,
      message: "Reports fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getReport(req.params.id as string);
    successRes({
      res,
      message: "Report fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateReportStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateReportStatus(
      req.user as IUser,
      req.body as updateReportStatusDTO,
      req.params.id as string,
    );
    successRes({
      res,
      message: "Report status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};

export const getLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getLogs(req.query as unknown as paginationQueryDTO);
    successRes({
      res,
      message: "Logs fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getStatsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getStats();
    successRes({
      res,
      message: "Stats fetched successfully",
      status: StatusCodes.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await updateUserStatus(
      req.user as IUser,
      req.body as updateUserStatusDTO,
      req.params.id as string,
    );
    successRes({
      res,
      message: "User status updated successfully",
      status: StatusCodes.OK,
    });
  } catch (err) {
    next(err);
  }
};
