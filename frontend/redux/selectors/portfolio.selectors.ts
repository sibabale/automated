// [ REDUX > SELECTORS > PORTFOLIO ] #################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    PortfolioErrorKind,
    PortfolioHolding,
    PortfolioMode,
    PortfolioStatus,
    PortfolioSummary,
} from '../slices/portfolio.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface PortfolioErrorView {
    kind: PortfolioErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectPortfolio = (state: RootState) => state.portfolio;

export const selectPortfolioStatus = createSelector(
    selectPortfolio,
    (slice): PortfolioStatus => slice.status,
);

export const selectPortfolioMode = createSelector(
    selectPortfolio,
    (slice): PortfolioMode => slice.mode,
);

export const selectPortfolioHoldings = createSelector(
    selectPortfolio,
    (slice): PortfolioHolding[] => slice.holdings,
);

export const selectPortfolioSummary = createSelector(
    selectPortfolio,
    (slice): PortfolioSummary | null => slice.summary,
);

export const selectPortfolioIsEmpty = createSelector(
    selectPortfolio,
    (slice): boolean => slice.status === 'succeeded' && slice.holdings.length === 0,
);

export const selectPortfolioError = createSelector(
    selectPortfolio,
    (slice): PortfolioErrorView | null => {
        if (slice.status !== 'failed' || !slice.errorKind) {
            return null;
        }

        return {
            kind: slice.errorKind,
            message: slice.errorMessage ?? 'The portfolio could not be loaded.',
        };
    },
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
