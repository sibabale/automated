// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP FINANCIAL DATA ] ##################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { FMP_ENDPOINTS } from "../../clients/fmp-client/index.js";
import { createFmpRepository, readNumber } from "../fmp-repository/index.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the financial-data port
 * for return on equity.
 *
 * The income statement (primary) supplies net income and the balance sheet
 * supplies shareholders' equity; the shared generic repository joins the two on
 * fiscal year, so this factory only declares the two statements and how to read
 * their figures. A year is included only when both statements report a usable
 * number for it.
 */
export function createFmpFinancialDataRepository(): FinancialDataRepository<FinancialYear> {
  return createFmpRepository<FinancialYear>({
    endpoints: [FMP_ENDPOINTS.incomeStatement, FMP_ENDPOINTS.balanceSheet],
    buildYear(fiscalYear, [incomeRow, balanceRow]) {
      const netIncome = readNumber(incomeRow, "netIncome");
      const shareholdersEquity = balanceRow
        ? readNumber(balanceRow, "totalStockholdersEquity")
        : null;

      if (netIncome === null || shareholdersEquity === null) {
        return null;
      }

      return { fiscalYear, netIncome, shareholdersEquity };
    },
  });
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
