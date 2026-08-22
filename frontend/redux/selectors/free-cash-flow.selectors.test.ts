// [ REDUX > SELECTORS > FREE CASH FLOW > TESTS ] ####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectFreeCashFlowError,
    selectFreeCashFlowHorizons,
    selectFreeCashFlowIsEmpty,
    selectFreeCashFlowStatus,
} from './free-cash-flow.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice: RootState['freeCashFlow']): RootState =>
    ({ freeCashFlow: slice }) as unknown as RootState;

const horizon = {
    label: 'Short Term',
    range: '1–3 Years',
    value: '$10.0B',
    breakdown: [{ period: '2024', value: '$10.0B' }],
    trend: 'up' as const,
};

const consolidatedSummary = {
    values: ['$10.0B'],
    result: '$10.0B',
    denominator: '1',
};

const trailingTwelveMonthsActuals = {
    operatingCashFlow: '$12.0B',
    capitalExpenditure: '$-2.0B',
    freeCashFlow: '$10.0B',
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('freeCashFlow selectors', () => {
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
            ticker: 'RDDT',
            horizons: [horizon],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectFreeCashFlowIsEmpty(loading)).toBe(false);
        expect(selectFreeCashFlowIsEmpty(empty)).toBe(true);
        expect(selectFreeCashFlowIsEmpty(loaded)).toBe(false);
    });

    it('exposes an error view only when the request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'RDDT',
            horizons: [],
            consolidatedSummary: null,
            trailingTwelveMonthsActuals: null,
            errorKind: 'rate-limit',
            errorMessage: 'Too many requests',
        });
        const succeeded = stateWith({
            status: 'succeeded',
            ticker: 'RDDT',
            horizons: [horizon],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectFreeCashFlowError(failed)).toEqual({ kind: 'rate-limit', message: 'Too many requests' });
        expect(selectFreeCashFlowError(succeeded)).toBeNull();
    });

    it('passes through the current status and horizons', () => {
        const loaded = stateWith({
            status: 'succeeded',
            ticker: 'RDDT',
            horizons: [horizon],
            consolidatedSummary,
            trailingTwelveMonthsActuals,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectFreeCashFlowStatus(loaded)).toBe('succeeded');
        expect(selectFreeCashFlowHorizons(loaded)).toEqual([horizon]);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
