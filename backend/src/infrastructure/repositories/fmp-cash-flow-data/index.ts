// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP CASH FLOW DATA ] ##################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { FMP_ENDPOINTS } from "../../clients/fmp-client/index.js";
import { createFmpRepository, readNumber } from "../fmp-repository/index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the financial-data port
 * for free cash flow.
 *
 * A single cash-flow statement supplies both inputs, so this factory declares
 * just that one endpoint and how to read operating cash flow and capital
 * expenditure from each row. The shared generic repository handles fetching,
 * ordering and exclusion; a year is included only when both figures are usable
 * numbers.
 */
export function createFmpCashFlowDataRepository(): FinancialDataRepository<CashFlowYear> {
  return createFmpRepository<CashFlowYear>({
    endpoints: [FMP_ENDPOINTS.cashFlow],
    buildYear(fiscalYear, [cashFlowRow]) {
      const operatingCashFlow = readNumber(cashFlowRow, "operatingCashFlow");
      const capitalExpenditure = readNumber(cashFlowRow, "capitalExpenditure");

      if (operatingCashFlow === null || capitalExpenditure === null) {
        return null;
      }

      return { fiscalYear, operatingCashFlow, capitalExpenditure };
    },
  });
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
