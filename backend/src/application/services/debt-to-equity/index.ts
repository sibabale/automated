// [ BACKEND > APPLICATION > SERVICES > DEBT TO EQUITY ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseHorizons } from "../horizon-analysis/index.js";
import type { HorizonAnalysis } from "../horizon-analysis/index.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The full debt-to-equity picture for a company across every horizon, including
 * the latest reported debt and equity figures for the formula display.
 */
export interface DebtToEquityAnalysis extends HorizonAnalysis<DebtToEquityYear> {
  ttmTotalDebt: number;
  ttmShareholdersEquity: number;
}
// 1.3. END ..........................................................................................

// 1.4. FORMULA ......................................................................................
/**
 * Applies the debt-to-equity formula to a single year, as a ratio.
 *
 * Returns `null` when shareholders' equity is zero or not a usable number,
 * because dividing by it would produce an infinite or meaningless leverage
 * figure that must be excluded from any average.
 */
export function calculateDebtToEquity(year: DebtToEquityYear): number | null {
  if (!Number.isFinite(year.shareholdersEquity) || year.shareholdersEquity === 0) {
    return null;
  }

  return year.totalDebt / year.shareholdersEquity;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Produces the horizon-based debt-to-equity analysis for a company.
 *
 * The metric-agnostic horizon engine does the fetching, grouping, averaging and
 * trend detection; this service only supplies the debt-to-equity formula and
 * reads the latest reported year for the formula panel. Missing history falls
 * back to numeric zeros.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The balance-sheet data source implementing the domain port.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseDebtToEquity(
  ticker: string,
  repository: FinancialDataRepository<DebtToEquityYear>,
  correlationId: string,
): Promise<DebtToEquityAnalysis> {
  const analysis = await analyseHorizons(ticker, repository, calculateDebtToEquity, correlationId);

  const latest = analysis.years[0] ?? { totalDebt: 0, shareholdersEquity: 0 };

  return {
    ...analysis,
    ttmTotalDebt: latest.totalDebt,
    ttmShareholdersEquity: latest.shareholdersEquity,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
