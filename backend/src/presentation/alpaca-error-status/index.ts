// [ BACKEND > PRESENTATION > ALPACA ERROR STATUS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { AlpacaClientError } from "../../infrastructure/clients/alpaca-client/index.js";
// 1.2. END ..........................................................................................

// 1.3. MAPPING ......................................................................................
/**
 * Translates an Alpaca provider failure into the HTTP status the client should see.
 */
export function statusForAlpacaError(kind: AlpacaClientError["kind"]): number {
  switch (kind) {
    case "forbidden":
      return 403;
    case "invalid-request":
      return 422;
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
