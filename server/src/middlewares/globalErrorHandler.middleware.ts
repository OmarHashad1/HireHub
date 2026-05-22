import { NextFunction, Request, Response } from "express";
import { IAppError } from "../types/appError.types.js";
import { StatusCodes } from "http-status-codes";
import { serverLogger } from "../utils/logger.util.js";

export const globalErrorHandler = (
  err: IAppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (status >= 500) {
    serverLogger.error({ err }, err.message);
  }

  res.status(status).json({
    statusCode: status,
    message: err.message || "Internal Server Error",
  });
};
