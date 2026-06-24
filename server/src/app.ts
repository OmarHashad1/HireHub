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
import { configPassport } from "./utils/passport.util.js";
import passport from "passport";
import { userRouter } from "./modules/user/user.router.js";
import { companyRouter } from "./modules/company/company.router.js";
import { requestFileMiddleware } from "./middlewares/requestFile.middleware.js";
import { auth } from "./middlewares/auth.middleware.js";
import { jobRouter } from "./modules/job/jobs.router.js";
import { applicationRouter } from "./modules/application/application.router.js";
import { savedJobRouter } from "./modules/saved-job/savedJobs.router.js";
import { reportRouter } from "./modules/report/report.router.js";
import { interviewRouter } from "./modules/interview/interview.router.js";
import { adminRouter } from "./modules/admin/admin.router.js";

export const app = async () => {
  const APP: Express = express();

  APP.use(helmet());
  APP.use(cors({ origin: CLIENT_URL, credentials: true }));
  APP.use(globalLimiter);
  APP.use(express.json());
  APP.use(cookieParser());
  APP.use(passport.initialize());

  try {
    await DBService.connectDB();
    await checkSMTP();
    await redisService.connect();

    configPassport();
    serverLogger.info("Core services initialized (DB, SMTP, Redis, Passport)");
  } catch (error) {
    serverLogger.error({ err: error }, "Startup failed");
    process.exit(1);
  }

  APP.use("/uploads/*path", auth, requestFileMiddleware);
  APP.use(ROUTES.USER.BASE, userRouter);
  APP.use(ROUTES.AUTH.BASE, authRouter);
  APP.use(ROUTES.COMPANY.BASE, companyRouter);
  APP.use(ROUTES.JOB.BASE, jobRouter);
  APP.use(ROUTES.APPLICATION.BASE, applicationRouter);
  APP.use(ROUTES.SAVED_JOB.BASE, savedJobRouter);
  APP.use(ROUTES.REPORT.BASE, reportRouter);
  APP.use(ROUTES.INTERVIEW.BASE, interviewRouter);
  APP.use(ROUTES.ADMIN.BASE, adminRouter);
  APP.all("/{*dummy}", (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundException());
  });

  APP.use(globalErrorHandler);

  const server = APP.listen(PORT, () => {
    serverLogger.info(`Server is running on port ${PORT}`);
  });

  server.on("error", (err) => {
    serverLogger.error({ err }, "Failed to start HTTP server");
    process.exit(1);
  });
};
