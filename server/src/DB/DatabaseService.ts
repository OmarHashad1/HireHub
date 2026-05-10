import { MONGODB_URI } from "../configs/env.js";
import { InternalServerErrorException } from "../utils/errorHandler.util.js";
import { serverLogger } from "../utils/logger.util.js";
import mongoose from "mongoose";

export class DatabaseService {
  private handleEvents(): void {
    mongoose.connection.on("error", (err) => {
      serverLogger.error({ err }, "DB Error");
    });
    mongoose.connection.on("connected", () => {
      serverLogger.info("DB Is Connected");
    });
    mongoose.connection.on("disconnected", () => {
      serverLogger.warn("DB Disconnected");
    });
  }
  public async connectDB(): Promise<void> {
    this.handleEvents();
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      serverLogger.info("Database service is ready");
    } catch (error) {
      serverLogger.error(`Database Connection Failed: ${error}`)
      throw new InternalServerErrorException(
        `Database Connection Failed: ${error}`,
      );
    }
  }
}

export const DBService = new DatabaseService();
