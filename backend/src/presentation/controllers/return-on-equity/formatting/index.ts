// [ BACKEND > PRESENTATION > CONTROLLERS > RETURN ON EQUITY > FORMATTING ] ##########################
//
// Pure presentation-formatting helpers for the return-on-equity response.
// Extracted from the controller so the calculation and formatting logic can be
// unit-tested directly with exhaustive, table-driven cases. Keeping these as
// small exported pure functions (rather than inline handler logic) shrinks the
// mutable surface and lets every boundary, literal, and branch be asserted
// exactly — see .github/skills/15-mutation-resistance.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// None — pure functions over primitives.
// 1.1. END ..........................................................................................

// 1.2. TYPES ........................................................................................
/**
 * Consolidated summary: the display-ready mean of all horizon values, with the
 * raw values and the denominator used to compute it.
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

/**
 * Parses a percentage string (e.g. "12.3%") back to its numeric value, or 0
 * when the string does not contain a parseable number.
 */
export function parsePercentValue(percentStr: string): number {
  // parseFloat stops at the first non-numeric character, so a trailing "%"
  // (the only shape formatPercent produces, e.g. "12.3%") is ignored without
  // any explicit stripping. Keeping the parse direct leaves no redundant
  // string literal for a mutant to exploit.
  const numeric = parseFloat(percentStr);
  return Number.isNaN(numeric) ? 0 : numeric;
}

/**
 * Calculates the consolidated summary — the arithmetic mean of the horizon
 * percentage strings. An empty input yields the placeholder summary rather than
 * dividing by zero.
 */
export function calculateConsolidatedSummary(
  horizonValues: string[],
): ConsolidatedSummary {
  if (!horizonValues || horizonValues.length === 0) {
    return { values: [], result: "—", denominator: "0" };
  }

  const numericValues = horizonValues.map(parsePercentValue);
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const average = sum / numericValues.length;

  return {
    values: horizonValues,
    result: formatPercent(average),
    denominator: String(numericValues.length),
  };
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
