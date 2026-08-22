// [ BACKEND > OBSERVABILITY > LOGGER ] ##############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import pino from "pino";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. LOGGER .......................................................................................
/**
 * Shared structured logger for application and request lifecycle events.
 *
 * Credentials are redacted before log output to prevent accidental disclosure.
 */
const isDevelopment = process.env.NODE_ENV !== "production";

const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers.set-cookie",
  ],
};

if (isDevelopment) {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    },
  };
}

export const logger = pino(loggerOptions);
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
