import type { RequestHandler } from "express";

import { HttpError } from "../errors/http-error.js";

/**
 * Produces a consistent failure for routes that were not registered.
 */
export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, `Route ${request.method} ${request.path} was not found`));
};
