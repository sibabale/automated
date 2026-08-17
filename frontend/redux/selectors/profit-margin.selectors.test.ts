// [ REDUX > SELECTORS > PROFIT MARGIN > TESTS ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectProfitMarginError,
    selectProfitMarginHorizons,
    selectProfitMarginIsEmpty,
    selectProfitMarginStatus,
} from './profit-margin.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice: RootState['profitMargin']): RootState =>
    ({ profitMargin: slice } as RootState);

const horizon = {
    label: 'Short Term',
    range: '1–3 Years',
    value: '25.0%',
    breakdown: [{ period: '2024', value: '25.0%' }],
    trend: 'up' as const,
};

const consolidatedSummary = {
    values: ['25.0%'],
    result: '25.0%',
    denominator: '1',
};

const trailingTwelveMonthsActuals = {
    netIncome: '$100',
    revenue: '$400',
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('profitMargin selectors', () => {
    it('reports emptiness only after a successful load returns no horizons', () => {
        const loading = stateWith({
            status: 'loading',
            ticker: null,
            horizons: [],
            consolidatedSummary: null,
            trailingTwelveMonthsActuals: null,
            errorKind: null,
            errorMessage: null,
        });
        const empty = stateWith({
            status: 'succeeded',
            ticker: 'ZZZZ',
            horizons: [],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });
        const loaded = stateWith({
            status: 'succeeded',
            ticker: 'AAPL',
            horizons: [horizon],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectProfitMarginIsEmpty(loading)).toBe(false);
        expect(selectProfitMarginIsEmpty(empty)).toBe(true);
        expect(selectProfitMarginIsEmpty(loaded)).toBe(false);
    });

    it('exposes an error view only when the request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary: null,
            trailingTwelveMonthsActuals: null,
            errorKind: 'not-found',
            errorMessage: 'Company not found',
        });
        const succeeded = stateWith({
            status: 'succeeded',
            ticker: 'AAPL',
            horizons: [horizon],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectProfitMarginError(failed)).toEqual({ kind: 'not-found', message: 'Company not found' });
        expect(selectProfitMarginError(succeeded)).toBeNull();
    });

    it('passes through the current status and horizons', () => {
        const loaded = stateWith({
            status: 'succeeded',
            ticker: 'AAPL',
            horizons: [horizon],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectProfitMarginStatus(loaded)).toBe('succeeded');
        expect(selectProfitMarginHorizons(loaded)).toEqual([horizon]);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
