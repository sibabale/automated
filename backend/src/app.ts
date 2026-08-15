// [ BACKEND > HTTP > APPLICATION ] ##################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import express from "express";
import type { Application } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found-handler.js";
import { logger } from "./logger.js";
// 1.2. END ..........................................................................................

// 1.3. APPLICATION ..................................................................................
/**
 * Creates the HTTP application without opening a network port.
 *
 * Keeping creation separate from process startup makes the request pipeline
 * directly testable and keeps transport concerns in `server.ts`.
 */
export function createApp(): Application {
  // 1.3.1. MIDDLEWARE ...............................................................................
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: "1mb" }));
  // 1.3.1. END ......................................................................................

  // 1.3.2. ROUTES ...................................................................................
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  // 1.3.2. END ......................................................................................

  // 1.3.3. ERROR HANDLING ...........................................................................
  app.use(notFoundHandler);
  app.use(errorHandler);
  // 1.3.3. END ......................................................................................

  return app;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
