// [ BACKEND > DOMAIN > REPOSITORIES > FINANCIAL DATA ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { FinancialYear } from "../entities/financial-year.entity.js";
// 1.2. END ..........................................................................................

// 1.3. PORT .........................................................................................
/**
 * The contract the application depends on to obtain a company's yearly
 * financials, expressed purely in domain terms.
 *
 * It says nothing about where the data comes from or how it is fetched. A
 * provider such as Financial Modeling Prep or Alpaca is supplied by an
 * infrastructure adapter that implements this interface, so swapping providers
 * never touches the domain or the services that rely on it.
 *
 * The port is generic over the year entity so each metric receives exactly the
 * reported fields its formula needs. It defaults to {@link FinancialYear} so
 * existing return-on-equity callers read unchanged.
 */
export interface FinancialDataRepository<TYear = FinancialYear> {
  /**
   * Returns up to `years` of completed fiscal years for a ticker, ordered
   * newest first. Years with incomplete figures are omitted rather than
   * guessed, so callers can trust every returned entry.
   *
   * @param ticker - The company's stock symbol, for example "AAPL".
   * @param years - The maximum number of recent fiscal years to return.
   * @param correlationId - Request-scoped identifier propagated for tracing.
   */
  getAnnualFinancials(
    ticker: string,
    years: number,
    correlationId: string,
  ): Promise<TYear[]>;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
