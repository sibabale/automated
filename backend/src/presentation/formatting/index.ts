// [ BACKEND > PRESENTATION > FORMATTING ] ###########################################################
//
// Pure presentation-formatting helpers shared by every metric response.
// Extracted from the controllers so the formatting logic can be unit-tested
// directly with exhaustive, table-driven cases. Keeping these as small exported
// pure functions (rather than inline handler logic) shrinks the mutable surface
// and lets every boundary, literal, and branch be asserted exactly — see
// .github/skills/15-mutation-resistance.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// None — pure functions over primitives.
// 1.1. END ..........................................................................................

// 1.2. TYPES ........................................................................................
/**
 * Consolidated summary: the display-ready mean of all horizon values, with the
 * raw formatted values and the denominator used to compute it.
 */
export interface ConsolidatedSummary {
  values: string[];
  denominator: string;
  result: string;
}
// 1.2. END ..........................................................................................

// 1.3. FORMATTERS ...................................................................................
/**
 * Formats a percentage to exactly one decimal place, matching the client's
 * display (e.g. 12.34 -> "12.3%").
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Formats a unitless ratio to exactly two decimal places, matching the client
 * display for debt-to-equity analysis (e.g. 1.875 -> "1.88").
 */
export function formatRatio(value: number): string {
  return value.toFixed(2);
}

/**
 * Formats a dollar amount to a human-readable shorthand: billions ("B") at or
 * above 1e9, millions ("M") at or above 1e6, otherwise whole dollars. The sign
 * is preserved by dividing the signed value while the suffix is chosen from the
 * magnitude (e.g. -2_500_000_000 -> "$-2.50B", 96_990_000_000 -> "$96.99B").
 */
export function formatCurrency(valueInDollars: number): string {
  const absValue = Math.abs(valueInDollars);

  if (absValue >= 1_000_000_000) {
    return `$${(valueInDollars / 1_000_000_000).toFixed(2)}B`;
  }

  if (absValue >= 1_000_000) {
    return `$${(valueInDollars / 1_000_000).toFixed(1)}M`;
  }

  return `$${valueInDollars.toFixed(0)}`;
}
// 1.3. END ..........................................................................................

// 1.4. CONSOLIDATION ................................................................................
/**
 * Calculates the consolidated summary — the arithmetic mean of the horizon
 * values — and formats it with the metric's own formatter so percentages and
 * dollar amounts each read correctly. An empty input yields the placeholder
 * summary rather than dividing by zero.
 *
 * @param numericValues - The precise per-horizon averages, still numeric.
 * @param format - The metric's formatter, applied to each value and the mean.
 */
export function calculateConsolidatedSummary(
  numericValues: number[],
  format: (value: number) => string,
): ConsolidatedSummary {
  if (numericValues.length === 0) {
    return { values: [], result: "\u2014", denominator: "0" };
  }

  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / numericValues.length;

  return {
    values: numericValues.map(format),
    result: format(mean),
    denominator: String(numericValues.length),
  };
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
