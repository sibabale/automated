// [ BACKEND > MIDDLEWARE > CORRELATION ID ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. MIDDLEWARE ...................................................................................
const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Assigns a correlation id to every request for end-to-end traceability.
 *
 * Reuses an inbound `x-correlation-id` header when present, otherwise generates
 * one. The id is echoed back on the response and bound to the request logger so
 * every downstream log line is attributable to a single request.
 */
export const correlationId: RequestHandler = (request, response, next) => {
  // 1.3.1. RESOLVE ID ...............................................................................
  const inbound = request.header(CORRELATION_ID_HEADER);
  const id = inbound && inbound.trim().length > 0 ? inbound : randomUUID();
  // 1.3.1. END ......................................................................................

  // 1.3.2. PROPAGATE ................................................................................
  request.correlationId = id;
  response.setHeader(CORRELATION_ID_HEADER, id);
  request.log = request.log.child({ correlationId: id });
  // 1.3.2. END ......................................................................................

  next();
};
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
