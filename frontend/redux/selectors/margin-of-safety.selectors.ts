// [ REDUX > SELECTORS > MARGIN OF SAFETY ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    MarginOfSafetyConsolidatedSummary,
    MarginOfSafetyErrorKind,
    MarginOfSafetyHorizonResult,
    MarginOfSafetyStatus,
    MarginOfSafetyTrailingTwelveMonthsActuals,
} from '../slices/margin-of-safety.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface MarginOfSafetyErrorView {
    kind: MarginOfSafetyErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectMarginOfSafety = (state: RootState) => state.marginOfSafety;

export const selectMarginOfSafetyStatus = createSelector(
    selectMarginOfSafety,
    (slice): MarginOfSafetyStatus => slice.status,
);

export const selectMarginOfSafetyHorizons = createSelector(
    selectMarginOfSafety,
    (slice): MarginOfSafetyHorizonResult[] => slice.horizons,
);

export const selectMarginOfSafetyIsEmpty = createSelector(
    selectMarginOfSafety,
    (slice): boolean =>
        slice.status === 'succeeded' &&
        (slice.consolidatedSummary?.values.length ?? 0) === 0,
);

export const selectMarginOfSafetyError = createSelector(
    selectMarginOfSafety,
    (slice): MarginOfSafetyErrorView | null => {
        if (slice.status !== 'failed' || !slice.errorKind) {
            return null;
        }

        return {
            kind: slice.errorKind,
            message: slice.errorMessage ?? 'The analysis could not be loaded.',
        };
    },
);

export const selectMarginOfSafetyConsolidatedSummary = createSelector(
    selectMarginOfSafety,
    (slice): MarginOfSafetyConsolidatedSummary | null => slice.consolidatedSummary,
);

export const selectMarginOfSafetyTrailingTwelveMonthsActuals = createSelector(
    selectMarginOfSafety,
    (slice): MarginOfSafetyTrailingTwelveMonthsActuals | null => slice.trailingTwelveMonthsActuals,
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
