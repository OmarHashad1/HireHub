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
  let status = err.statusCode;
  let message = err.message;


  if (!status) {
    const raw = err as unknown as {
      name?: string;
      code?: number | string;
      keyValue?: Record<string, unknown>;
    };

    if (raw.name === "MulterError") {
      status = StatusCodes.BAD_REQUEST;
      if (raw.code === "LIMIT_FILE_SIZE") message = "File is too large";
    } else if (raw.code === 11000) {
      status = StatusCodes.CONFLICT;
      const field = Object.keys(raw.keyValue ?? {})[0];
      message = field ? `${field} already exists` : "Resource already exists";
    } else if (raw.name === "ValidationError" || raw.name === "CastError") {
      status = StatusCodes.BAD_REQUEST;
    }
  }

  status = status || StatusCodes.INTERNAL_SERVER_ERROR;

  if (status >= 500) {
    serverLogger.error({ err }, err.message);
  }

  res.status(status).json({
    statusCode: status,
    message: message || "Internal Server Error",
    ...(err.data && { data: err.data }),
  });
};
