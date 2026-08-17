// [ REDUX > SELECTORS > DEBT TO EQUITY > TESTS ] ####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectDebtToEquityError,
    selectDebtToEquityHorizons,
    selectDebtToEquityIsEmpty,
    selectDebtToEquityStatus,
} from './debt-to-equity.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice: RootState['debtToEquity']): RootState =>
    ({ debtToEquity: slice } as RootState);

const horizon = {
    label: 'Short Term',
    range: '1–3 Years',
    value: '2.00',
    breakdown: [{ period: '2024', value: '2.00' }],
    trend: 'up' as const,
};

const consolidatedSummary = {
    values: ['2.00'],
    result: '2.00',
    denominator: '1',
};

const trailingTwelveMonthsActuals = {
    totalDebt: '$120',
    shareholdersEquity: '$60',
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('debtToEquity selectors', () => {
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

        expect(selectDebtToEquityIsEmpty(loading)).toBe(false);
        expect(selectDebtToEquityIsEmpty(empty)).toBe(true);
        expect(selectDebtToEquityIsEmpty(loaded)).toBe(false);
    });

    it('exposes an error view only when the request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary: null,
            trailingTwelveMonthsActuals: null,
            errorKind: 'timeout',
            errorMessage: 'Timed out',
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

        expect(selectDebtToEquityError(failed)).toEqual({ kind: 'timeout', message: 'Timed out' });
        expect(selectDebtToEquityError(succeeded)).toBeNull();
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

        expect(selectDebtToEquityStatus(loaded)).toBe('succeeded');
        expect(selectDebtToEquityHorizons(loaded)).toEqual([horizon]);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
