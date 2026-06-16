import { NextFunction, Request, Response } from "express";
import { ROLE } from "../enums/user.enums.js";
import { ForbiddenExceptions } from "../utils/errorHandler.util.js";

export const checkRole = (allowedRoles: ROLE[] = [ROLE.USER]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!allowedRoles.includes(req.user?.role as ROLE)) {
        throw new ForbiddenExceptions(
          "You do not have permission to access this resource",
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
