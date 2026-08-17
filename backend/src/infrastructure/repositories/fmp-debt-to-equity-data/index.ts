// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP DEBT TO EQUITY DATA ] #############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { FMP_ENDPOINTS } from "../../clients/fmp-client/index.js";
import { createFmpRepository, readNumber } from "../fmp-repository/index.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the financial-data port
 * for debt to equity.
 *
 * A single balance-sheet statement supplies both total debt and shareholders'
 * equity, so this factory declares one endpoint and reads both figures from the
 * same row. The shared generic repository handles fetching, ordering and fiscal
 * year selection; a year is included only when both figures are usable numbers.
 */
export function createFmpDebtToEquityDataRepository(): FinancialDataRepository<DebtToEquityYear> {
  return createFmpRepository<DebtToEquityYear>({
    endpoints: [FMP_ENDPOINTS.balanceSheet],
    buildYear(fiscalYear, [balanceRow]) {
      const totalDebt = readNumber(balanceRow, "totalDebt");
      const shareholdersEquity = readNumber(balanceRow, "totalStockholdersEquity");

      if (totalDebt === null || shareholdersEquity === null) {
        return null;
      }

      return { fiscalYear, totalDebt, shareholdersEquity };
    },
  });
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
