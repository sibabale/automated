import { createApp } from "./app.js";
import { logger } from "./logger.js";

const DEFAULT_PORT = 3001;

/**
 * Reads and validates the port before the server begins accepting requests.
 */
function getPort(value = process.env.PORT): number {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

const port = getPort();
const app = createApp();

app.listen(port, () => {
  logger.info({ port }, "HTTP server listening");
});
