// [ BACKEND > HTTP > APPLICATION ] ##################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import helmet from "helmet";
import express from "express";
import { pinoHttp } from "pino-http";
import type { Application } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "./logger.js";
import { errorHandler } from "./application/middleware/error-handler/index.js";
import { correlationId } from "./application/middleware/correlation-id/index.js";
import { notFoundHandler } from "./application/middleware/not-found-handler/index.js";
import { profitMarginController } from "./presentation/controllers/profit-margin/index.js";
import { debtToEquityController } from "./presentation/controllers/debt-to-equity/index.js";
import { freeCashFlowController } from "./presentation/controllers/free-cash-flow/index.js";
import { returnOnEquityController } from "./presentation/controllers/return-on-equity/index.js";
// 1.2. END ..........................................................................................

// 1.3. APPLICATION ..................................................................................
/**
 * Creates the HTTP application without opening a network port.
 *
 * Keeping creation separate from process startup makes the request pipeline
 * directly testable and keeps transport concerns in `server.ts`.
 */
export function createApp(options?: { repositoryFactory?: () => any }): Application {
  // 1.3.1. MIDDLEWARE ...............................................................................
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(correlationId);
  app.use(express.json({ limit: "1mb" }));

  // Allow tests to override repository creation for every metric via options.
  // When absent, each controller falls back to its own production repository,
  // so a single override can stand in for all metrics during testing.
  if (options?.repositoryFactory) {
    app.set("repositoryFactory", options.repositoryFactory);
  }
  // 1.3.1. END ......................................................................................

  // 1.3.2. ROUTES ...................................................................................
  app.get("/health", (request, response) => {
    response.status(200).json({ status: "ok", correlationId: request.correlationId });
  });

  app.get("/analysis/return-on-equity", returnOnEquityController);
  app.get("/analysis/free-cash-flow", freeCashFlowController);
  app.get("/analysis/debt-to-equity", debtToEquityController);
  app.get("/analysis/profit-margin", profitMarginController);
  // 1.3.2. END ......................................................................................

  // 1.3.3. ERROR HANDLING ...........................................................................
  app.use(notFoundHandler);
  app.use(errorHandler);
  // 1.3.3. END ......................................................................................

  return app;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
