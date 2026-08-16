// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP FINANCIAL DATA ] ##################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { FmpRecord } from "../../clients/fmp-client/index.js";
import { fmpGetJson, FMP_ENDPOINTS } from "../../clients/fmp-client/index.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
/**
 * Reads a value from an opaque provider row and returns it only when it is a
 * usable finite number, otherwise `null`. This keeps missing or malformed
 * figures from silently entering the calculation as zeros or `NaN`.
 */
function readNumber(row: FmpRecord, key: string): number | null {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Determines the fiscal year for a provider row.
 *
 * Financial Modeling Prep exposes an explicit `fiscalYear` on most statements
 * but not always, so we fall back to the leading year of the reporting `date`.
 */
function readFiscalYear(row: FmpRecord): number | null {
  const explicit = Number(row["fiscalYear"]);
  if (Number.isInteger(explicit) && explicit > 1900) {
    return explicit;
  }

  const date = row["date"];
  if (typeof date === "string") {
    const year = Number(date.slice(0, 4));
    if (Number.isInteger(year) && year > 1900) {
      return year;
    }
  }

  return null;
}
// 1.3. END ..........................................................................................

// 1.4. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the financial-data port.
 *
 * The income statement supplies net income and the balance sheet supplies
 * shareholders' equity; the two are joined on fiscal year so the application
 * receives one clean {@link FinancialYear} per reported period.
 */
export function createFmpFinancialDataRepository(): FinancialDataRepository {
  return {
    async getAnnualFinancials(ticker, years, correlationId): Promise<FinancialYear[]> {
      // 1.4.1. FETCH ................................................................................
      // Both statements are requested in parallel because neither depends on
      // the other. Each returns the most recent `years` annual filings, which
      // we then align by fiscal year.
      const [incomeRows, balanceRows] = await Promise.all([
        fmpGetJson(
          FMP_ENDPOINTS.incomeStatement,
          { symbol: ticker, period: "annual", limit: years },
          correlationId,
        ),
        fmpGetJson(
          FMP_ENDPOINTS.balanceSheet,
          { symbol: ticker, period: "annual", limit: years },
          correlationId,
        ),
      ]);
      // 1.4.1. END ..................................................................................

      // 1.4.2. JOIN .................................................................................
      // Index equity by fiscal year first, then walk the income rows so the
      // result preserves the provider's newest-first ordering. A year is only
      // included when both statements report a usable figure for it.
      const equityByYear = new Map<number, number>();
      for (const row of balanceRows) {
        const year = readFiscalYear(row);
        const equity = readNumber(row, "totalStockholdersEquity");
        if (year !== null && equity !== null) {
          equityByYear.set(year, equity);
        }
      }

      const financials: FinancialYear[] = [];
      for (const row of incomeRows) {
        const year = readFiscalYear(row);
        const netIncome = readNumber(row, "netIncome");
        if (year === null || netIncome === null) {
          continue;
        }

        const shareholdersEquity = equityByYear.get(year);
        if (shareholdersEquity === undefined) {
          continue;
        }

        financials.push({ fiscalYear: year, netIncome, shareholdersEquity });
      }
      // 1.4.2. END ..................................................................................

      return financials;
    },
  };
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
