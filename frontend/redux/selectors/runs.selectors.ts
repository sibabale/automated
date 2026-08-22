// [ REDUX > SELECTORS > RUNS ] #######################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type { RunsErrorKind, RunsItem, RunsStatus } from '../slices/runs.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface RunsErrorView {
    kind: RunsErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectRuns = (state: RootState) => state.runs;

export const selectRunsStatus = createSelector(selectRuns, (slice): RunsStatus => slice.status);

export const selectRunsItems = createSelector(selectRuns, (slice): RunsItem[] => slice.items);

export const selectRunsIsEmpty = createSelector(
    selectRuns,
    (slice): boolean => slice.status === 'succeeded' && slice.items.length === 0,
);

export const selectRunsError = createSelector(
    selectRuns,
    (slice): RunsErrorView | null => {
        if (slice.status !== 'failed' || !slice.errorKind) {
            return null;
        }

        return {
            kind: slice.errorKind,
            message: slice.errorMessage ?? 'The runs could not be loaded.',
        };
    },
);

export const selectRunsPage = createSelector(selectRuns, (slice): number => slice.page);
export const selectRunsTotalPages = createSelector(selectRuns, (slice): number => slice.totalPages);
export const selectRunsTotalItems = createSelector(selectRuns, (slice): number => slice.totalItems);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
