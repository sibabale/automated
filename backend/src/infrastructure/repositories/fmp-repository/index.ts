// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP REPOSITORY ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { fmpGetJson } from "../../clients/fmp-client/index.js";
import type { FmpRecord, FmpEndpoint } from "../../clients/fmp-client/index.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
/**
 * Reads a value from an opaque provider row and returns it only when it is a
 * usable finite number, otherwise `null`. This keeps missing or malformed
 * figures from silently entering the calculation as zeros or `NaN`.
 */
export function readNumber(row: FmpRecord, key: string): number | null {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Determines the fiscal year for a provider row.
 *
 * Financial Modeling Prep exposes an explicit `fiscalYear` on most statements
 * but not always, so we fall back to the leading year of the reporting `date`.
 */
export function readFiscalYear(row: FmpRecord): number | null {
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

// 1.4. TYPES ........................................................................................
/**
 * Assembles one domain year from the provider rows that share a fiscal year.
 *
 * `rows` is aligned to the configured endpoints: `rows[0]` is the primary
 * statement's row for this year (always present, since the builder is only
 * called for primary rows) and each later entry is the matching row from the
 * corresponding supporting statement, or `undefined` when that statement has no
 * row for the year. Returning `null` drops the year, which is how a metric
 * excludes periods with missing or malformed figures.
 */
export type FmpYearBuilder<TYear> = (
  fiscalYear: number,
  rows: [FmpRecord, ...Array<FmpRecord | undefined>],
) => TYear | null;

/**
 * Declares how a metric's reported years are sourced from the provider: the
 * ordered statements to fetch (the first is primary and sets the result order)
 * and the builder that turns each aligned set of rows into a domain year. At
 * least one endpoint — the primary statement — is required.
 */
export interface FmpRepositoryConfig<TYear> {
  endpoints: readonly [FmpEndpoint, ...FmpEndpoint[]];
  buildYear: FmpYearBuilder<TYear>;
}
// 1.4. END ..........................................................................................

// 1.5. REPOSITORY ...................................................................................
/**
 * Builds a Financial Modeling Prep implementation of the financial-data port
 * for any metric from a declarative {@link FmpRepositoryConfig}.
 *
 * All configured statements are fetched in parallel because none depends on the
 * others. The supporting statements are indexed by fiscal year, then the
 * primary statement is walked so the result preserves the provider's
 * newest-first ordering. Each primary row is aligned with the matching
 * supporting rows and handed to `buildYear`, which decides whether the year is
 * usable. This shared mechanism means a new metric only supplies its endpoints
 * and a field mapping, never fetch or join code.
 */
export function createFmpRepository<TYear extends { fiscalYear: number }>(
  config: FmpRepositoryConfig<TYear>,
): FinancialDataRepository<TYear> {
  return {
    async getAnnualFinancials(ticker, years, correlationId): Promise<TYear[]> {
      // 1.5.1. FETCH ................................................................................
      // The primary statement and every supporting statement are fetched
      // concurrently. Splitting the primary out keeps its rows strongly typed as
      // present (it drives ordering) while supporting statements stay a list.
      const [primaryEndpoint, ...supportingEndpoints] = config.endpoints;
      const [primaryRows, supportingRowsList] = await Promise.all([
        fmpGetJson(primaryEndpoint, { symbol: ticker, limit: years }, correlationId),
        Promise.all(
          supportingEndpoints.map((endpoint) =>
            fmpGetJson(endpoint, { symbol: ticker, limit: years }, correlationId),
          ),
        ),
      ]);
      // 1.5.1. END ..................................................................................

      // 1.5.2. INDEX SUPPORTING STATEMENTS ..........................................................
      // Each supporting statement is looked up by fiscal year, so build one map
      // per supporting endpoint from year to its row.
      const supportingByYear = supportingRowsList.map((rows) => {
        const byYear = new Map<number, FmpRecord>();
        for (const row of rows) {
          const year = readFiscalYear(row);
          if (year !== null) {
            byYear.set(year, row);
          }
        }
        return byYear;
      });
      // 1.5.2. END ..................................................................................

      // 1.5.3. JOIN .................................................................................
      // Walk the primary statement newest-first; for each row gather the
      // matching supporting rows and let the metric's builder accept or reject
      // the year. A year with no readable fiscal year is skipped outright.
      const financials: TYear[] = [];
      for (const primaryRow of primaryRows) {
        const year = readFiscalYear(primaryRow);
        if (year === null) {
          continue;
        }

        const alignedRows: [FmpRecord, ...Array<FmpRecord | undefined>] = [
          primaryRow,
          ...supportingByYear.map((byYear) => byYear.get(year)),
        ];
        const built = config.buildYear(year, alignedRows);
        if (built !== null) {
          financials.push(built);
        }
      }
      // 1.5.3. END ..................................................................................

      return financials;
    },
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
