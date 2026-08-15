// [ REDUX > SELECTORS > RETURN ON EQUITY > TESTS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectReturnOnEquityError,
    selectReturnOnEquityHorizons,
    selectReturnOnEquityIsEmpty,
    selectReturnOnEquityStatus,
} from './return-on-equity.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice: RootState['returnOnEquity']): RootState =>
    ({ returnOnEquity: slice }) as unknown as RootState;

const horizon = {
    label: 'Short Term',
    range: '1–3 Years',
    value: '26.1%',
    breakdown: [{ period: '2024', value: '28.3%' }],
    trend: 'up' as const,
};

const consolidatedSummary = {
    values: ['26.1%'],
    result: '26.1%',
    denominator: '1',
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('returnOnEquity selectors', () => {
    it('reports emptiness only after a successful load returns no horizons', () => {
        const loading = stateWith({ status: 'loading', ticker: null, horizons: [], consolidatedSummary: null, errorKind: null, errorMessage: null });
        const empty = stateWith({ status: 'succeeded', ticker: 'ZZZZ', horizons: [], consolidatedSummary, errorKind: null, errorMessage: null });
        const loaded = stateWith({ status: 'succeeded', ticker: 'AAPL', horizons: [horizon], consolidatedSummary, errorKind: null, errorMessage: null });

        expect(selectReturnOnEquityIsEmpty(loading)).toBe(false);
        expect(selectReturnOnEquityIsEmpty(empty)).toBe(true);
        expect(selectReturnOnEquityIsEmpty(loaded)).toBe(false);
    });

    it('exposes an error view only when the request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary: null,
            errorKind: 'rate-limit',
            errorMessage: 'Too many requests',
        });
        const succeeded = stateWith({ status: 'succeeded', ticker: 'AAPL', horizons: [horizon], consolidatedSummary, errorKind: null, errorMessage: null });

        expect(selectReturnOnEquityError(failed)).toEqual({ kind: 'rate-limit', message: 'Too many requests' });
        expect(selectReturnOnEquityError(succeeded)).toBeNull();
    });

    it('passes through the current status and horizons', () => {
        const loaded = stateWith({ status: 'succeeded', ticker: 'AAPL', horizons: [horizon], consolidatedSummary, errorKind: null, errorMessage: null });

        expect(selectReturnOnEquityStatus(loaded)).toBe('succeeded');
        expect(selectReturnOnEquityHorizons(loaded)).toEqual([horizon]);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
