import { app } from "./app.js";
import { serverLogger } from "./utils/logger.util.js";

try {
  serverLogger.info("Bootstrapping HireHub server...");
  await app();
} catch (err) {
  serverLogger.error({ err }, "Fatal error during server bootstrap");
  process.exit(1);
}
