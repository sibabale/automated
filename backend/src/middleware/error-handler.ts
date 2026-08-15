import type { ErrorRequestHandler } from "express";

import { HttpError } from "../errors/http-error.js";

/**
 * Converts application failures into a consistent JSON response.
 *
 * Unexpected failures are logged with their original error and never expose
 * their details to clients.
 */
export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const isExpected = error instanceof HttpError;
  const statusCode = isExpected ? error.statusCode : 500;

  if (statusCode >= 500) {
    request.log.error({ err: error }, "Request failed unexpectedly");
  } else {
    request.log.warn({ err: error }, "Request failed");
  }

  response.status(statusCode).json({
    error: {
      message: isExpected ? error.message : "Internal server error",
    },
  });
};
