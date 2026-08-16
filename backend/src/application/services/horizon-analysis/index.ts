// [ BACKEND > APPLICATION > SERVICES > HORIZON ANALYSIS ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The value of a metric for a single fiscal year, already reduced from the raw
 * reported figures to one comparable number (a percentage, a dollar amount, a
 * ratio — the engine does not care which).
 */
export interface YearlyValue {
  fiscalYear: number;
  value: number;
}

/**
 * A band of consecutive years grouped for comparison, with the average metric
 * value across the band and the direction of travel from oldest to newest.
 */
export interface Horizon {
  key: string;
  label: string;
  range: string;
  average: number;
  breakdown: YearlyValue[];
  trend: "up" | "down";
}

/**
 * The full horizon picture for one company and one metric. `years` is the
 * ordered (newest-first) source data so a metric can read the latest year for
 * its trailing-twelve-month actuals without re-fetching.
 */
export interface HorizonAnalysis<TYear> {
  ticker: string;
  horizons: Horizon[];
  years: TYear[];
}

/**
 * Reduces one fiscal year of reported figures to a single metric value, or
 * `null` when the year cannot be used (for example dividing by zero equity).
 * Excluded years never enter an average and so never distort it.
 */
export type MetricFormula<TYear> = (year: TYear) => number | null;
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
export const HORIZONS = [
  { key: "short", label: "Short Term", range: "1\u20133 Years" },
  { key: "medium", label: "Medium Term", range: "3\u20136 Years" },
  { key: "long", label: "Long Term", range: "6\u20139 Years" },
  { key: "veryLong", label: "Very Long Term", range: "9\u201312 Years" },
] as const;

export const YEARS_PER_HORIZON = 3;
export const HORIZON_YEARS = HORIZONS.length * YEARS_PER_HORIZON;
// 1.4. END ..........................................................................................

// 1.5. CALCULATION ..................................................................................
/**
 * Averages a list of yearly figures. The caller guarantees a non-empty list.
 */
function average(values: number[]): number {
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

/**
 * Turns one block of years into a reported horizon using the metric formula.
 *
 * The block arrives newest-first, so the trend compares the most recent year
 * against the oldest in the band: a newer figure at or above the older one is
 * an improving ("up") trend, otherwise it is declining ("down"). Years the
 * formula rejects are dropped, and a block with no usable year yields `null`.
 */
function toHorizon<TYear extends { fiscalYear: number }>(
  definition: (typeof HORIZONS)[number],
  years: TYear[],
  formula: MetricFormula<TYear>,
): Horizon | null {
  const breakdown: YearlyValue[] = [];
  for (const year of years) {
    const value = formula(year);
    if (value !== null) {
      breakdown.push({ fiscalYear: year.fiscalYear, value });
    }
  }

  if (breakdown.length === 0) {
    return null;
  }

  const newest = breakdown[0]!.value;
  const oldest = breakdown[breakdown.length - 1]!.value;

  return {
    key: definition.key,
    label: definition.label,
    range: definition.range,
    average: average(breakdown.map((entry) => entry.value)),
    breakdown,
    trend: newest >= oldest ? "up" : "down",
  };
}
// 1.5. END ..........................................................................................

// 1.6. ENGINE .......................................................................................
/**
 * Produces the horizon-based analysis of a metric for a company.
 *
 * The engine is metric-agnostic: it fetches reported years through the domain
 * port, sorts them newest-first, splits them into consecutive, non-overlapping
 * blocks of {@link YEARS_PER_HORIZON}, and applies the supplied formula to each
 * year. Horizons with no usable data are omitted. Every metric (return on
 * equity, free cash flow, and so on) reuses this by supplying only its own
 * per-year formula.
 *
 * @param ticker - The company's stock symbol, for example "AAPL".
 * @param repository - The financial-data source implementing the domain port.
 * @param formula - Reduces one reported year to a single comparable value.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function analyseHorizons<TYear extends { fiscalYear: number }>(
  ticker: string,
  repository: FinancialDataRepository<TYear>,
  formula: MetricFormula<TYear>,
  correlationId: string,
): Promise<HorizonAnalysis<TYear>> {
  // 1.6.1. FETCH ....................................................................................
  logger.debug({ correlationId, ticker }, "Analysing metric horizons");

  const financials = await repository.getAnnualFinancials(ticker, HORIZON_YEARS, correlationId);
  const years = [...financials].sort((a, b) => b.fiscalYear - a.fiscalYear);
  // 1.6.1. END ......................................................................................

  // 1.6.2. GROUP ....................................................................................
  const horizons: Horizon[] = [];
  HORIZONS.forEach((definition, index) => {
    const start = index * YEARS_PER_HORIZON;
    const block = years.slice(start, start + YEARS_PER_HORIZON);
    const horizon = toHorizon(definition, block, formula);
    if (horizon !== null) {
      horizons.push(horizon);
    }
  });
  // 1.6.2. END ......................................................................................

  logger.info({ correlationId, ticker, horizons: horizons.length }, "Metric horizons analysed");

  return { ticker, horizons, years };
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
