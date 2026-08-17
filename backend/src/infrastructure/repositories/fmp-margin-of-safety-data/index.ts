// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP MARGIN OF SAFETY DATA ] ###########################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { readFiscalYear, readNumber } from "../fmp-repository/index.js";
import { FMP_ENDPOINTS, fmpGetJson } from "../../clients/fmp-client/index.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the financial-data port
 * for margin of safety.
 *
 * The documented stable discounted-cash-flow endpoint returns the provider's
 * current intrinsic-value estimate (`dcf`) alongside the matching market price.
 * Margin of safety now treats that response as a current snapshot, so this
 * adapter fetches one endpoint with no statement-style `period` parameter and
 * maps the usable rows directly into valuation facts.
 */
export function createFmpMarginOfSafetyDataRepository(): FinancialDataRepository<MarginOfSafetyYear> {
  return {
    async getAnnualFinancials(ticker, years, correlationId): Promise<MarginOfSafetyYear[]> {
      const rows = await fmpGetJson(
        FMP_ENDPOINTS.discountedCashFlow,
        { symbol: ticker },
        correlationId,
      );

      const valuationSnapshots: MarginOfSafetyYear[] = [];
      for (const row of rows) {
        const fiscalYear = readFiscalYear(row);
        const intrinsicValue = readNumber(row, "dcf");

        // FMP exposes the market-price field under different keys across API
        // surfaces, so accept both the documented spaced key and the camelCase
        // variant rather than coupling the feature to one payload spelling.
        const stockPrice =
          readNumber(row, "Stock Price") ??
          readNumber(row, "stockPrice");

        if (fiscalYear === null || intrinsicValue === null || stockPrice === null) {
          continue;
        }

        valuationSnapshots.push({ fiscalYear, intrinsicValue, stockPrice });
      }

      return valuationSnapshots.slice(0, years);
    },
  };
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
