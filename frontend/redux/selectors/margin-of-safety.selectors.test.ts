// [ REDUX > SELECTORS > MARGIN OF SAFETY > TESTS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectMarginOfSafetyError,
    selectMarginOfSafetyHorizons,
    selectMarginOfSafetyIsEmpty,
    selectMarginOfSafetyStatus,
} from './margin-of-safety.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice: RootState['marginOfSafety']): RootState =>
    ({ marginOfSafety: slice } as RootState);

const horizon = {
    label: 'Short Term',
    range: '1–3 Years',
    value: '20.0%',
    breakdown: [{ period: '2024', value: '20.0%' }],
    trend: 'up' as const,
};

const consolidatedSummary = {
    values: ['20.0%'],
    result: '20.0%',
    denominator: '1',
};

const trailingTwelveMonthsActuals = {
    intrinsicValue: '$250.00',
    stockPrice: '$200.00',
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('marginOfSafety selectors', () => {
    it('reports emptiness only after a successful load returns no current snapshot summary', () => {
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
            consolidatedSummary: { values: [], result: '—', denominator: '0' },
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });
        const loaded = stateWith({
            status: 'succeeded',
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectMarginOfSafetyIsEmpty(loading)).toBe(false);
        expect(selectMarginOfSafetyIsEmpty(empty)).toBe(true);
        expect(selectMarginOfSafetyIsEmpty(loaded)).toBe(false);
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

        expect(selectMarginOfSafetyError(failed)).toEqual({ kind: 'not-found', message: 'Company not found' });
        expect(selectMarginOfSafetyError(succeeded)).toBeNull();
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

        expect(selectMarginOfSafetyStatus(loaded)).toBe('succeeded');
        expect(selectMarginOfSafetyHorizons(loaded)).toEqual([horizon]);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
