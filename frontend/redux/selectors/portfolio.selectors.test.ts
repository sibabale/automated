// [ REDUX > SELECTORS > PORTFOLIO > TESTS ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    selectPortfolioError,
    selectPortfolioHoldings,
    selectPortfolioIsEmpty,
    selectPortfolioMode,
    selectPortfolioStatus,
    selectPortfolioSummary,
} from './portfolio.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const baseState = {
    counter: { value: 0 },
    theme: { mode: 'light' },
    overview: { status: 'idle', ticker: null, metrics: [], reportHeader: null, errorKind: null, errorMessage: null },
    debtToEquity: {},
    freeCashFlow: {},
    marginOfSafety: {},
    profitMargin: {},
    returnOnEquity: {},
    portfolio: {
        status: 'idle',
        mode: 'paper',
        holdings: [],
        summary: null,
        errorKind: null,
        errorMessage: null,
    },
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('portfolio selectors', () => {
    it('returns the status, mode, holdings, and summary', () => {
        const state = {
            ...baseState,
            portfolio: {
                status: 'succeeded',
                mode: 'paper',
                holdings: [{ ticker: 'MSFT' }],
                summary: { totalValue: '$1.00' },
                errorKind: null,
                errorMessage: null,
            },
        };

        expect(selectPortfolioStatus(state as never)).toBe('succeeded');
        expect(selectPortfolioMode(state as never)).toBe('paper');
        expect(selectPortfolioHoldings(state as never)).toEqual([{ ticker: 'MSFT' }]);
        expect(selectPortfolioSummary(state as never)).toEqual({ totalValue: '$1.00' });
    });

    it('reports the empty state only when loading finished with no holdings', () => {
        const emptyState = {
            ...baseState,
            portfolio: {
                status: 'succeeded',
                mode: 'paper',
                holdings: [],
                summary: { totalValue: '$0.00' },
                errorKind: null,
                errorMessage: null,
            },
        };
        const loadingState = {
            ...baseState,
            portfolio: {
                status: 'loading',
                mode: 'paper',
                holdings: [],
                summary: null,
                errorKind: null,
                errorMessage: null,
            },
        };

        expect(selectPortfolioIsEmpty(emptyState as never)).toBe(true);
        expect(selectPortfolioIsEmpty(loadingState as never)).toBe(false);
    });

    it('returns a friendly error view only when the request failed', () => {
        const failedState = {
            ...baseState,
            portfolio: {
                status: 'failed',
                mode: 'paper',
                holdings: [],
                summary: null,
                errorKind: 'network',
                errorMessage: 'Portfolio is offline',
            },
        };

        expect(selectPortfolioError(failedState as never)).toEqual({
            kind: 'network',
            message: 'Portfolio is offline',
        });
        expect(selectPortfolioError(baseState as never)).toBeNull();
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
