// [ BACKEND > APPLICATION > SERVICES > MARGIN OF SAFETY ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The current margin-of-safety snapshot for a company.
 *
 * Margin of safety no longer pretends to have a documented year-by-year history
 * from the provider. The service therefore exposes only the latest usable
 * intrinsic value, stock price, and computed percentage.
 */
export interface MarginOfSafetyAnalysis {
  ticker: string;
  currentMarginOfSafety: number | null;
  currentIntrinsicValue: number | null;
  currentStockPrice: number | null;
}
// 1.3. END ..........................................................................................

// 1.4. FORMULA ......................................................................................
/**
 * Applies the margin-of-safety formula to a single yearly valuation snapshot,
 * as a percentage.
 *
 * Returns `null` when intrinsic value is zero, negative, or not usable,
 * because the denominator would be invalid and a non-positive intrinsic-value
 * estimate does not represent a meaningful safety buffer.
 */
export function calculateMarginOfSafety(year: MarginOfSafetyYear): number | null {
  if (!Number.isFinite(year.intrinsicValue) || year.intrinsicValue <= 0) {
    return null;
  }

  return ((year.intrinsicValue - year.stockPrice) / year.intrinsicValue) * 100;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Produces the current margin-of-safety analysis for a company.
 *
 * The repository returns the provider's current valuation snapshot. This
 * service keeps the business rule focused on the pure formula and exposes the
 * raw valuation inputs so the client can render the exact facts behind the
 * current percentage.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The valuation data source implementing the domain port.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseMarginOfSafety(
  ticker: string,
  repository: FinancialDataRepository<MarginOfSafetyYear>,
  correlationId: string,
): Promise<MarginOfSafetyAnalysis> {
  const latest = (await repository.getAnnualFinancials(ticker, 1, correlationId))[0] ?? null;
  const currentMarginOfSafety = latest ? calculateMarginOfSafety(latest) : null;

  return {
    ticker,
    currentMarginOfSafety,
    currentIntrinsicValue: latest && currentMarginOfSafety !== null ? latest.intrinsicValue : null,
    currentStockPrice: latest && currentMarginOfSafety !== null ? latest.stockPrice : null,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
