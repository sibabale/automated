// [ BACKEND > APPLICATION > SERVICES > RETURN ON EQUITY ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../logger.js";
import type { FinancialYear } from "../../domain/entities/financial-year.entity.js";
import type { FinancialDataRepository } from "../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * Return on equity for one fiscal year, expressed as a percentage.
 */
export interface YearlyReturnOnEquity {
  fiscalYear: number;
  returnOnEquity: number;
}

/**
 * A band of consecutive years grouped for comparison, with its average return
 * on equity and the direction of travel across the band.
 */
export interface ReturnOnEquityHorizon {
  key: string;
  label: string;
  range: string;
  averageReturnOnEquity: number;
  breakdown: YearlyReturnOnEquity[];
  trend: "up" | "down";
}

/**
 * The full return-on-equity picture for a company across every horizon,
 * including TTM actuals for formula display.
 */
export interface ReturnOnEquityAnalysis {
  ticker: string;
  horizons: ReturnOnEquityHorizon[];
  ttmNetIncome: number;
  ttmShareholdersEquity: number;
}
// 1.3. END ..........................................................................................

// 1.4. CONFIGURATION ................................................................................
/**
 * The horizons reported to the client, newest band first.
 *
 * The ranges read as overlapping ("3\u20136" follows "1\u20133") but each band owns a
 * distinct, non-overlapping block of years: the labels describe the boundary
 * in human terms while the data is partitioned into consecutive groups of
 * {@link YEARS_PER_HORIZON}. No year is ever counted in two horizons.
 */
const HORIZONS = [
  { key: "short", label: "Short Term", range: "1\u20133 Years" },
  { key: "medium", label: "Medium Term", range: "3\u20136 Years" },
  { key: "long", label: "Long Term", range: "6\u20139 Years" },
  { key: "veryLong", label: "Very Long Term", range: "9\u201312 Years" },
] as const;

const YEARS_PER_HORIZON = 3;
const HORIZON_YEARS = HORIZONS.length * YEARS_PER_HORIZON;
// 1.4. END ..........................................................................................

// 1.5. CALCULATION ..................................................................................
/**
 * Applies the return-on-equity formula to a single year.
 *
 * Returns `null` when equity is zero or not a usable number, because dividing
 * by it would produce an infinite or meaningless figure that must be excluded
 * from any average rather than distorting it.
 */
export function calculateReturnOnEquity(year: FinancialYear): number | null {
  if (!Number.isFinite(year.shareholdersEquity) || year.shareholdersEquity === 0) {
    return null;
  }

  return (year.netIncome / year.shareholdersEquity) * 100;
}

/**
 * Averages a list of yearly figures. The caller guarantees a non-empty list.
 */
function average(values: number[]): number {
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

/**
 * Turns one block of years into a reported horizon.
 *
 * The block arrives newest-first, so the trend compares the most recent year
 * against the oldest in the band: a newer figure at or above the older one is
 * an improving ("up") trend, otherwise it is declining ("down").
 */
function toHorizon(
  definition: (typeof HORIZONS)[number],
  years: FinancialYear[],
): ReturnOnEquityHorizon | null {
  const breakdown: YearlyReturnOnEquity[] = [];
  for (const year of years) {
    const returnOnEquity = calculateReturnOnEquity(year);
    if (returnOnEquity !== null) {
      breakdown.push({ fiscalYear: year.fiscalYear, returnOnEquity });
    }
  }

  if (breakdown.length === 0) {
    return null;
  }

  const newest = breakdown[0]!.returnOnEquity;
  const oldest = breakdown[breakdown.length - 1]!.returnOnEquity;

  return {
    key: definition.key,
    label: definition.label,
    range: definition.range,
    averageReturnOnEquity: average(breakdown.map((entry) => entry.returnOnEquity)),
    breakdown,
    trend: newest >= oldest ? "up" : "down",
  };
}
// 1.5. END ..........................................................................................

// 1.6. SERVICE ......................................................................................
/**
 * Produces the horizon-based return-on-equity analysis for a company.
 *
 * The repository is injected so the service depends only on the domain
 * contract, never on a specific data provider. Reported years are sorted
 * newest-first and split into consecutive, non-overlapping blocks of
 * {@link YEARS_PER_HORIZON}; horizons with no usable data are omitted.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The financial-data source implementing the domain port.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseReturnOnEquity(
  ticker: string,
  repository: FinancialDataRepository,
  correlationId: string,
): Promise<ReturnOnEquityAnalysis> {
  // 1.6.1. FETCH ....................................................................................
  logger.debug({ correlationId, ticker }, "Analysing return on equity");

  const financials = await repository.getAnnualFinancials(ticker, HORIZON_YEARS, correlationId);
  const ordered = [...financials].sort((a, b) => b.fiscalYear - a.fiscalYear);
  // 1.6.1. END ......................................................................................

  // 1.6.2. GROUP ....................................................................................
  const horizons: ReturnOnEquityHorizon[] = [];
  HORIZONS.forEach((definition, index) => {
    const start = index * YEARS_PER_HORIZON;
    const block = ordered.slice(start, start + YEARS_PER_HORIZON);
    const horizon = toHorizon(definition, block);
    if (horizon !== null) {
      horizons.push(horizon);
    }
  });
  // 1.6.2. END ......................................................................................

  // 1.6.3. TTM ACTUALS ..............................................................................
  const ttmYear = ordered[0] ?? { netIncome: 0, shareholdersEquity: 0 };
  const ttmNetIncome = ttmYear.netIncome ?? 0;
  const ttmShareholdersEquity = ttmYear.shareholdersEquity ?? 0;
  // 1.6.3. END ......................................................................................

  logger.info({ correlationId, ticker, horizons: horizons.length }, "Return on equity analysed");

  return { ticker, horizons, ttmNetIncome, ttmShareholdersEquity };
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
