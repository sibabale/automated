// [ BACKEND > APPLICATION > SERVICES > PROFIT MARGIN ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseHorizons } from "../horizon-analysis/index.js";
import type { HorizonAnalysis } from "../horizon-analysis/index.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The full profit-margin picture for a company across every horizon, including
 * trailing-twelve-month actuals for the formula display.
 */
export interface ProfitMarginAnalysis extends HorizonAnalysis<ProfitMarginYear> {
  ttmNetIncome: number;
  ttmRevenue: number;
}
// 1.3. END ..........................................................................................

// 1.4. FORMULA ......................................................................................
/**
 * Applies the profit-margin formula to a single year, as a percentage.
 *
 * Returns `null` when revenue is zero or not a usable number, because dividing
 * by it would produce an infinite or meaningless profitability figure that must
 * be excluded from any average.
 */
export function calculateProfitMargin(year: ProfitMarginYear): number | null {
  if (!Number.isFinite(year.revenue) || year.revenue === 0) {
    return null;
  }

  return (year.netIncome / year.revenue) * 100;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Produces the horizon-based profit-margin analysis for a company.
 *
 * The metric-agnostic horizon engine does the fetching, grouping, averaging and
 * trend detection; this service only supplies the profit-margin formula and
 * reads the latest reported year for the trailing-twelve-month actuals shown in
 * the formula panel. Missing history falls back to numeric zeros.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The income-statement data source implementing the domain port.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseProfitMargin(
  ticker: string,
  repository: FinancialDataRepository<ProfitMarginYear>,
  correlationId: string,
): Promise<ProfitMarginAnalysis> {
  const analysis = await analyseHorizons(ticker, repository, calculateProfitMargin, correlationId);

  const latest = analysis.years[0] ?? { netIncome: 0, revenue: 0 };

  return {
    ...analysis,
    ttmNetIncome: latest.netIncome,
    ttmRevenue: latest.revenue,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
