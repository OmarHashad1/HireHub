import { StatusCodes } from "http-status-codes";
import { IAppError } from "../types/appError.types.js";

export class AppError extends Error implements IAppError {
  constructor(
    message: string,
    public statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export class InternalServerErrorException extends AppError {
  constructor(
    message: string = "Internal Server Error",
    options?: ErrorOptions,
  ) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, options);
  }
}

export class NotFoundException extends AppError {
  constructor(
    message: string = "Resource request not found",
    options?: ErrorOptions,
  ) {
    super(message, StatusCodes.NOT_FOUND, options);
  }
}

export class ConflictException extends AppError {
  constructor(
    message: string = "Resource already exists",
    options?: ErrorOptions,
  ) {
    super(message, StatusCodes.CONFLICT, options);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = "Unauthorized", options?: ErrorOptions) {
    super(message, StatusCodes.UNAUTHORIZED, options);
  }
}
