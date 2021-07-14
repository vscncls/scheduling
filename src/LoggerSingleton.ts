import pino from "pino";

class LoggerSingleton {
  private static instance: pino.Logger;
  public getInstance(): pino.Logger {
    if (!LoggerSingleton.instance) {
      LoggerSingleton.instance = pino({
        level: process.env.LOG_LEVEL || "info",
      });
    }

    return LoggerSingleton.instance;
  }
}

export { LoggerSingleton };
