// [ REDUX > SELECTORS > DEBT TO EQUITY ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    DebtToEquityConsolidatedSummary,
    DebtToEquityErrorKind,
    DebtToEquityHorizonResult,
    DebtToEquityStatus,
    DebtToEquityTrailingTwelveMonthsActuals,
} from '../slices/debt-to-equity.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface DebtToEquityErrorView {
    kind: DebtToEquityErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectDebtToEquity = (state: RootState) => state.debtToEquity;

/**
 * The current request lifecycle status for the analysis.
 */
export const selectDebtToEquityStatus = createSelector(
    selectDebtToEquity,
    (slice): DebtToEquityStatus => slice.status,
);

/**
 * The horizon cards to render once the analysis has loaded.
 */
export const selectDebtToEquityHorizons = createSelector(
    selectDebtToEquity,
    (slice): DebtToEquityHorizonResult[] => slice.horizons,
);

/**
 * True only when the analysis loaded successfully but returned no horizons.
 */
export const selectDebtToEquityIsEmpty = createSelector(
    selectDebtToEquity,
    (slice): boolean => slice.status === 'succeeded' && slice.horizons.length === 0,
);

/**
 * A friendly error description when the analysis failed, otherwise null.
 */
export const selectDebtToEquityError = createSelector(
    selectDebtToEquity,
    (slice): DebtToEquityErrorView | null => {
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
export const selectDebtToEquityConsolidatedSummary = createSelector(
    selectDebtToEquity,
    (slice): DebtToEquityConsolidatedSummary | null => slice.consolidatedSummary,
);

/**
 * The latest reported debt and equity figures for the formula section display.
 */
export const selectDebtToEquityTrailingTwelveMonthsActuals = createSelector(
    selectDebtToEquity,
    (slice): DebtToEquityTrailingTwelveMonthsActuals | null => slice.trailingTwelveMonthsActuals,
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
