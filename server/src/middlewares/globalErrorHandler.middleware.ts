import { NextFunction, Request, Response } from "express";
import { IAppError } from "../types/appError.types.js";
import { StatusCodes } from "http-status-codes";
export const globalErrorHandler = (
  err: IAppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Internal Server Error",
  });
};
