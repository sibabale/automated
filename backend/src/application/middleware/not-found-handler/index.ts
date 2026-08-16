// [ BACKEND > MIDDLEWARE > NOT FOUND HANDLER ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
// 1.2. END ..........................................................................................

// 1.3. MIDDLEWARE ...................................................................................
/**
 * Produces a consistent failure for routes that were not registered.
 */
export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, `Route ${request.method} ${request.path} was not found`));
};
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
