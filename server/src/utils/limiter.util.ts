import { rateLimit } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import { errorRes } from "./response.util.js";

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      statusCode: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many requests, please try again later.",
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    errorRes({
      res,
      status: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many attempts, please try again in 10 minutes.",
    });
  },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    errorRes({
      res,
      status: StatusCodes.TOO_MANY_REQUESTS,
      message: "AI rating limit reached, please try again in an hour.",
    });
  },
});
