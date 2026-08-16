// [ BACKEND > PRESENTATION > FMP ERROR STATUS ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { FmpClientError } from "../../infrastructure/clients/fmp-client/index.js";
// 1.2. END ..........................................................................................

// 1.3. MAPPING ......................................................................................
/**
 * Translates a provider failure into the HTTP status the client should see.
 *
 * Shared by every metric controller so the mapping from a data-provider fault
 * to an HTTP status code stays identical across the whole API: a missing ticker
 * is a 404, throttling a 429, a slow provider a 504, and anything else a 502
 * because the fault originates upstream, not in this service.
 */
export function statusForFmpError(kind: FmpClientError["kind"]): number {
  switch (kind) {
    case "not-found":
      return 404;
    case "rate-limit":
      return 429;
    case "timeout":
      return 504;
    default:
      return 502;
  }
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
