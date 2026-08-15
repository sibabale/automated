// [ REDUX > SELECTORS > RETURN ON EQUITY ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    ConsolidatedSummary,
    TrailingTwelveMonthsActuals,
    ReturnOnEquityErrorKind,
    ReturnOnEquityHorizonResult,
    ReturnOnEquityStatus,
} from '../slices/return-on-equity.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface ReturnOnEquityErrorView {
    kind: ReturnOnEquityErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectReturnOnEquity = (state: RootState) => state.returnOnEquity;

/**
 * The current request lifecycle status for the analysis.
 */
export const selectReturnOnEquityStatus = createSelector(
    selectReturnOnEquity,
    (slice): ReturnOnEquityStatus => slice.status,
);

/**
 * The horizon cards to render once the analysis has loaded.
 */
export const selectReturnOnEquityHorizons = createSelector(
    selectReturnOnEquity,
    (slice): ReturnOnEquityHorizonResult[] => slice.horizons,
);

/**
 * True only when the analysis loaded successfully but returned no horizons,
 * which is how an unknown or newly listed company presents itself.
 */
export const selectReturnOnEquityIsEmpty = createSelector(
    selectReturnOnEquity,
    (slice): boolean => slice.status === 'succeeded' && slice.horizons.length === 0,
);

/**
 * A friendly error description when the analysis failed, otherwise null.
 */
export const selectReturnOnEquityError = createSelector(
    selectReturnOnEquity,
    (slice): ReturnOnEquityErrorView | null => {
        if (slice.status !== 'failed' || !slice.errorKind) {
            return null;
        }

        return {
            kind: slice.errorKind,
            message: slice.errorMessage ?? 'The analysis could not be loaded.',
        };
    },
);

/**
 * The consolidated summary (arithmetic mean of horizons) for display in the lead section
 * and consolidation summary section. Returns null until the analysis succeeds.
 *
 * Memoized so the value stays the same across renders unless the underlying state changes.
 */
export const selectConsolidatedSummary = createSelector(
    selectReturnOnEquity,
    (slice): ConsolidatedSummary | null => slice.consolidatedSummary,
);

/**
 * The TTM (trailing twelve months) actuals for the formula section display.
 * Returns null until the analysis succeeds.
 *
 * Trailing Twelve Months (TTM) represents the most recent 12-month period of
 * financial data, useful for understanding current operating performance.
 *
 * Memoized so the value stays the same across renders unless the underlying state changes.
 */
export const selectTrailingTwelveMonthsActuals = createSelector(
    selectReturnOnEquity,
    (slice): TrailingTwelveMonthsActuals | null => slice.trailingTwelveMonthsActuals,
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
