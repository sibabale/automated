// [ REDUX > SELECTORS > PROFIT MARGIN ] #############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    ProfitMarginConsolidatedSummary,
    ProfitMarginErrorKind,
    ProfitMarginHorizonResult,
    ProfitMarginStatus,
    ProfitMarginTrailingTwelveMonthsActuals,
} from '../slices/profit-margin.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface ProfitMarginErrorView {
    kind: ProfitMarginErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectProfitMargin = (state: RootState) => state.profitMargin;

/**
 * The current request lifecycle status for the analysis.
 */
export const selectProfitMarginStatus = createSelector(
    selectProfitMargin,
    (slice): ProfitMarginStatus => slice.status,
);

/**
 * The horizon cards to render once the analysis has loaded.
 */
export const selectProfitMarginHorizons = createSelector(
    selectProfitMargin,
    (slice): ProfitMarginHorizonResult[] => slice.horizons,
);

/**
 * True only when the analysis loaded successfully but returned no horizons.
 */
export const selectProfitMarginIsEmpty = createSelector(
    selectProfitMargin,
    (slice): boolean => slice.status === 'succeeded' && slice.horizons.length === 0,
);

/**
 * A friendly error description when the analysis failed, otherwise null.
 */
export const selectProfitMarginError = createSelector(
    selectProfitMargin,
    (slice): ProfitMarginErrorView | null => {
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
 * The consolidated summary for display in the lead section and consolidation summary section.
 */
export const selectProfitMarginConsolidatedSummary = createSelector(
    selectProfitMargin,
    (slice): ProfitMarginConsolidatedSummary | null => slice.consolidatedSummary,
);

/**
 * The latest reported net income and revenue figures for the formula section display.
 */
export const selectProfitMarginTrailingTwelveMonthsActuals = createSelector(
    selectProfitMargin,
    (slice): ProfitMarginTrailingTwelveMonthsActuals | null => slice.trailingTwelveMonthsActuals,
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
