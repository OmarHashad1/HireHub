import { RedisClientType, createClient } from "redis";
import { serverLogger } from "../utils/logger.util.js";
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USERNAME,
} from "../configs/env.js";
export class RedisService {
  private readonly client: RedisClientType;
  constructor() {
    this.client = createClient({
      username: REDIS_USERNAME,
      password: REDIS_PASSWORD,
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });
    this.handleEvents();
  }
  private handleEvents() {
    this.client.on("error", (err) =>
      serverLogger.error({ err }, "Redis Error"),
    );
    this.client.on("ready", () => serverLogger.info("Redis Is Connected"));
  }
  public async connect() {
    try {
      await this.client.connect();
      serverLogger.info("Redis Service is ready");
    } catch (err) {
      serverLogger.error({ err }, "Redis Error");
    }
  }
}

export const redisService = new RedisService();
