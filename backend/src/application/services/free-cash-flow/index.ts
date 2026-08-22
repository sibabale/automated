// [ BACKEND > APPLICATION > SERVICES > FREE CASH FLOW ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseHorizons } from "../horizon-analysis/index.js";
import type { HorizonAnalysis } from "../horizon-analysis/index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The full free-cash-flow picture for a company across every horizon, including
 * trailing-twelve-month actuals for the formula display.
 */
export interface FreeCashFlowAnalysis extends HorizonAnalysis<CashFlowYear> {
  ttmOperatingCashFlow: number;
  ttmCapitalExpenditure: number;
  ttmCoverageYears: number | null;
}
// 1.3. END ..........................................................................................

// 1.4. FORMULA ......................................................................................
/**
 * Applies the free-cash-flow formula to a single year, in dollars.
 *
 * Free cash flow is operating cash flow minus capital expenditure. The provider
 * reports capital expenditure as a negative outflow, so the two figures are
 * added: a positive operating inflow and a negative investing outflow combine
 * to the cash left over. Both inputs are guaranteed finite by the repository,
 * so the result is always a usable number and no year is excluded here.
 */
export function calculateFreeCashFlow(year: CashFlowYear): number | null {
  return year.operatingCashFlow + year.capitalExpenditure;
}

export function calculateFreeCashFlowCoverageYears(year: CashFlowYear): number | null {
  if (!Number.isFinite(year.operatingCashFlow) || year.operatingCashFlow <= 0) {
    return null;
  }

  return calculateFreeCashFlow(year) / year.operatingCashFlow;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Produces the horizon-based free-cash-flow analysis for a company.
 *
 * The metric-agnostic horizon engine does the fetching, grouping, averaging and
 * trend detection; this service only supplies the free-cash-flow formula and
 * reads the latest reported year for the trailing-twelve-month actuals shown in
 * the formula panel. Missing history falls back to numeric zeros.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The cash-flow data source implementing the domain port.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseFreeCashFlow(
  ticker: string,
  repository: FinancialDataRepository<CashFlowYear>,
  correlationId: string,
): Promise<FreeCashFlowAnalysis> {
  const analysis = await analyseHorizons(ticker, repository, calculateFreeCashFlow, correlationId);

  const latest = analysis.years[0] ?? { operatingCashFlow: 0, capitalExpenditure: 0 };

  return {
    ...analysis,
    ttmCoverageYears: calculateFreeCashFlowCoverageYears(latest),
    ttmOperatingCashFlow: latest.operatingCashFlow,
    ttmCapitalExpenditure: latest.capitalExpenditure,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
