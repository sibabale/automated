// [ BACKEND > MIDDLEWARE > ERROR HANDLER ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { ErrorRequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../errors/http-error.js";
// 1.2. END ..........................................................................................

// 1.3. MIDDLEWARE ...................................................................................
/**
 * Converts application failures into a consistent JSON response.
 *
 * Unexpected failures are logged with their original error and never expose
 * their details to clients.
 */
export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  // 1.3.1. LOCAL VARIABLES ..........................................................................
  const isExpected = error instanceof HttpError;
  const statusCode = isExpected ? error.statusCode : 500;
  const correlationId = request.correlationId;
  // 1.3.1. END ......................................................................................

  // 1.3.2. CORE LOGIC ...............................................................................
  if (statusCode >= 500) {
    request.log.error({ err: error }, "Request failed unexpectedly");
  } else {
    request.log.warn({ err: error }, "Request failed");
  }

  response.status(statusCode).json({
    correlationId,
    error: {
      message: isExpected ? error.message : "Internal server error",
    },
  });
  // 1.3.2. END ......................................................................................
};
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
