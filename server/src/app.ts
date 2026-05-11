import express, { Express, NextFunction, Request, Response } from "express";
import { PORT } from "./configs/env.js";
import helmet from "helmet";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";
import { NotFoundException } from "./utils/errorHandler.util.js";
import { DBService } from "./DB/DatabaseService.js";
import "./models/index.js";
import { checkSMTP } from "./utils/smtp.util.js";
import { globalLimiter } from "./utils/limiter.util.js";
export const app = async () => {
  const APP: Express = express();

  APP.use(globalLimiter);
  APP.use(helmet());
  APP.use(express.json());

  try {
    await DBService.connectDB();
    await checkSMTP();
  } catch (error) {
    process.exit(1);
  }

  APP.all("/{*dummy}", (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundException());
  });

  APP.use(globalErrorHandler);

  APP.listen(PORT);
};
