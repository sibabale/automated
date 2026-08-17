// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP PROFIT MARGIN DATA ] ##############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { FMP_ENDPOINTS } from "../../clients/fmp-client/index.js";
import { createFmpRepository, readNumber } from "../fmp-repository/index.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the financial-data port
 * for profit margin.
 *
 * Profit margin needs only the income statement: revenue as the sales base and
 * net income as the earnings kept from those sales. The shared generic
 * repository handles fetching, ordering, and malformed-row exclusion; this
 * factory only declares the statement and how to read its two required fields.
 */
export function createFmpProfitMarginDataRepository(): FinancialDataRepository<ProfitMarginYear> {
  return createFmpRepository<ProfitMarginYear>({
    endpoints: [FMP_ENDPOINTS.incomeStatement],
    buildYear(fiscalYear, [incomeRow]) {
      const netIncome = readNumber(incomeRow, "netIncome");
      const revenue = readNumber(incomeRow, "revenue");

      if (netIncome === null || revenue === null) {
        return null;
      }

      return { fiscalYear, netIncome, revenue };
    },
  });
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
