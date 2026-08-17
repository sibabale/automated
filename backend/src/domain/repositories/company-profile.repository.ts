// [ BACKEND > DOMAIN > REPOSITORIES > COMPANY PROFILE ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { CompanyProfile } from "../entities/company-profile.entity.js";
// 1.2. END ..........................................................................................

// 1.3. PORT .........................................................................................
/**
 * The contract the application depends on to obtain a company's overview
 * identity details.
 */
export interface CompanyProfileRepository {
  /**
   * Returns the current profile facts for a ticker.
   *
   * @param ticker - The company's stock symbol, for example "AAPL".
   * @param correlationId - Request-scoped identifier propagated for tracing.
   */
  getProfile(ticker: string, correlationId: string): Promise<CompanyProfile>;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
