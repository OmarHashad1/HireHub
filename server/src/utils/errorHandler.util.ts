import { StatusCodes } from "http-status-codes";
import { IAppError } from "../types/appError.types.js";

export type AppErrorOptions = ErrorOptions & {
  data?: Record<string, unknown> | undefined;
};

export class AppError extends Error implements IAppError {
  public data?: Record<string, unknown> | undefined;
  constructor(
    message: string,
    public statusCode: number,
    options?: AppErrorOptions,
  ) {
    super(message, options);
    this.data = options?.data;
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
  constructor(message: string = "Unauthorized", options?: AppErrorOptions) {
    super(message, StatusCodes.UNAUTHORIZED, options);
  }
}

export class ForbiddenExceptions extends AppError {
  constructor(message: string = "Forbidden Action", options?: ErrorOptions) {
    super(message, StatusCodes.FORBIDDEN, options);
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = "Bad Request", options?: AppErrorOptions) {
    super(message, StatusCodes.BAD_REQUEST, options);
  }
}

export class TooManyRequestsException extends AppError {
  constructor(message: string = "Too Many Requests", options?: AppErrorOptions) {
    super(message, StatusCodes.TOO_MANY_REQUESTS, options);
  }
}
