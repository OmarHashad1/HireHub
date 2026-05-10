import { Writable } from "stream";
import { logModel } from "../models/log.model.js";

export const dbTransport = new Writable({
  objectMode: true,
  write(chunk, _encoding, callback) {
    try {
      const log = JSON.parse(chunk.toString());
      logModel.create({
        level: log.level,
        message: log.msg,
        actor: log.actor ?? null,
        action: log.action ?? null,
        targetType: log.targetType ?? null,
        targetId: log.targetId ?? null,
        createdAt: new Date(log.time),
      });

      callback();
    } catch {
      callback();
    }
  },
});
