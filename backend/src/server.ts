// [ BACKEND > HTTP > SERVER ] #######################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "./app.js";
import { logger } from "./logger.js";
import { fileURLToPath } from "node:url";
import { startCronRunner } from "./services/cron-runner/index.js";
// 1.2. END ..........................................................................................

// 1.3. CONSTANTS ....................................................................................
const DEFAULT_PORT = 3001;
// 1.3. END ..........................................................................................

// 1.4. FUNCTIONS ....................................................................................
/**
 * Reads and validates the port before the server begins accepting requests.
 *
 * Exported so tests can exercise all validation branches without triggering
 * the server-startup side effects at the bottom of this file.
 */
export function getPort(value = process.env.PORT): number {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}
// 1.4. END ..........................................................................................

// 1.5. SERVER .......................................................................................
/**
 * Opens the network port and starts accepting requests.
 *
 * Kept in a function guarded by the entry-point check below so importing this
 * module (for example from tests that exercise {@link getPort}) has no side
 * effects and never binds a port.
 */
export function startServer(): void {
  const port = getPort();
  const app = createApp();
  let cronRunnerStarted = false;

  app.listen(port, () => {
    logger.info({ port }, "HTTP server listening");

    // `listening` can fire again if this helper is reused across environments
    // that restart the underlying server object, so guard the singleton runner.
    if (!cronRunnerStarted) {
      startCronRunner();
      cronRunnerStarted = true;
    }
  });
}

// Only start the server when this file is run directly as the process entry
// point, not when it is imported. `process.argv[1]` is the executed script's
// path, which matches this module's own path only for a direct run.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
