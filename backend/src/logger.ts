import pino from "pino";

/**
 * Shared structured logger for application and request lifecycle events.
 *
 * Credentials are redacted before log output to prevent accidental disclosure.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers.set-cookie",
  ],
});
