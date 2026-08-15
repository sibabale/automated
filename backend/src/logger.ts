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
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers.set-cookie",
  ],
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
