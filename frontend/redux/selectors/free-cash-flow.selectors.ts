// [ REDUX > SELECTORS > FREE CASH FLOW ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    FreeCashFlowConsolidatedSummary,
    FreeCashFlowErrorKind,
    FreeCashFlowHorizonResult,
    FreeCashFlowStatus,
    FreeCashFlowTrailingTwelveMonthsActuals,
} from '../slices/free-cash-flow.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface FreeCashFlowErrorView {
    kind: FreeCashFlowErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectFreeCashFlow = (state: RootState) => state.freeCashFlow;

/**
 * The current request lifecycle status for the analysis.
 */
export const selectFreeCashFlowStatus = createSelector(
    selectFreeCashFlow,
    (slice): FreeCashFlowStatus => slice.status,
);

/**
 * The horizon cards to render once the analysis has loaded.
 */
export const selectFreeCashFlowHorizons = createSelector(
    selectFreeCashFlow,
    (slice): FreeCashFlowHorizonResult[] => slice.horizons,
);

/**
 * True only when the analysis loaded successfully but returned no horizons.
 */
export const selectFreeCashFlowIsEmpty = createSelector(
    selectFreeCashFlow,
    (slice): boolean => slice.status === 'succeeded' && slice.horizons.length === 0,
);

/**
 * A friendly error description when the analysis failed, otherwise null.
 */
export const selectFreeCashFlowError = createSelector(
    selectFreeCashFlow,
    (slice): FreeCashFlowErrorView | null => {
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
export const selectFreeCashFlowConsolidatedSummary = createSelector(
    selectFreeCashFlow,
    (slice): FreeCashFlowConsolidatedSummary | null => slice.consolidatedSummary,
);

/**
 * The TTM (trailing twelve months) actuals for the formula section display.
 */
export const selectFreeCashFlowTrailingTwelveMonthsActuals = createSelector(
    selectFreeCashFlow,
    (slice): FreeCashFlowTrailingTwelveMonthsActuals | null => slice.trailingTwelveMonthsActuals,
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
