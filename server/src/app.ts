import express, { Express, NextFunction, Request, Response } from "express";
import { CLIENT_URL, PORT } from "./configs/env.config.js";
import helmet from "helmet";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";
import { NotFoundException } from "./utils/errorHandler.util.js";
import { DBService } from "./DB/DatabaseService.js";
import "./models/index.js";
import { checkSMTP } from "./utils/smtp.util.js";
import { globalLimiter } from "./utils/limiter.util.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { ROUTES } from "./routes.js";
import { redisService } from "./DB/RedisService.js";
import { serverLogger } from "./utils/logger.util.js";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = async () => {
  const APP: Express = express();

  APP.use(helmet());
  APP.use(cors({ origin: CLIENT_URL, credentials: true }));
  APP.use(globalLimiter);
  APP.use(express.json());
  APP.use(cookieParser());

  try {
    await DBService.connectDB();
    await checkSMTP();
    await redisService.connect();
  } catch (error) {
    serverLogger.error({ err: error }, "Startup failed");
    process.exit(1);
  }

  APP.use(ROUTES.AUTH.BASE, authRouter);

  APP.all("/{*dummy}", (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundException());
  });

  APP.use(globalErrorHandler);

  APP.listen(PORT);
};
