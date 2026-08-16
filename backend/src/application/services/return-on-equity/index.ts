// [ BACKEND > APPLICATION > SERVICES > RETURN ON EQUITY ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseHorizons } from "../horizon-analysis/index.js";
import type { HorizonAnalysis } from "../horizon-analysis/index.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The full return-on-equity picture for a company across every horizon,
 * including trailing-twelve-month actuals for the formula display.
 */
export interface ReturnOnEquityAnalysis extends HorizonAnalysis<FinancialYear> {
  ttmNetIncome: number;
  ttmShareholdersEquity: number;
}
// 1.3. END ..........................................................................................

// 1.4. FORMULA ......................................................................................
/**
 * Applies the return-on-equity formula to a single year, as a percentage.
 *
 * Returns `null` when equity is zero or not a usable number, because dividing
 * by it would produce an infinite or meaningless figure that must be excluded
 * from any average rather than distorting it.
 */
export function calculateReturnOnEquity(year: FinancialYear): number | null {
  if (!Number.isFinite(year.shareholdersEquity) || year.shareholdersEquity === 0) {
    return null;
  }

  return (year.netIncome / year.shareholdersEquity) * 100;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Produces the horizon-based return-on-equity analysis for a company.
 *
 * The metric-agnostic horizon engine does the fetching, grouping, averaging and
 * trend detection; this service only supplies the return-on-equity formula and
 * reads the latest reported year for the trailing-twelve-month actuals shown in
 * the formula panel. Missing history falls back to numeric zeros.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The financial-data source implementing the domain port.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseReturnOnEquity(
  ticker: string,
  repository: FinancialDataRepository<FinancialYear>,
  correlationId: string,
): Promise<ReturnOnEquityAnalysis> {
  const analysis = await analyseHorizons(ticker, repository, calculateReturnOnEquity, correlationId);

  const latest = analysis.years[0] ?? { netIncome: 0, shareholdersEquity: 0 };

  return {
    ...analysis,
    ttmNetIncome: latest.netIncome,
    ttmShareholdersEquity: latest.shareholdersEquity,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
