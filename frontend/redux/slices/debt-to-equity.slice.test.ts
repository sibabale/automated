// [ REDUX > SLICES > DEBT TO EQUITY > TESTS ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetchDebtToEquity } from './debt-to-equity.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { debtToEquity: reducer } });

const jsonResponse = (status: number, body: unknown) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('debtToEquity slice', () => {
    it('stores the ticker, horizons, and actuals on a successful analysis', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-dte-001');
        const horizons = [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '2.00',
                breakdown: [{ period: '2024', value: '2.00' }],
                trend: 'up' as const,
            },
        ];
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                ticker: 'AAPL',
                horizons,
                consolidatedSummary: { values: ['2.00'], result: '2.00', denominator: '1' },
                trailingTwelveMonthsActuals: { totalDebt: '$120', shareholdersEquity: '$60' },
            },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const store = makeStore();
        await store.dispatch(fetchDebtToEquity('AAPL'));
        const state = store.getState().debtToEquity;

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/analysis/debt-to-equity?ticker=AAPL',
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-dte-001',
                }),
            }),
        );
        expect(state.status).toBe('succeeded');
        expect(state.ticker).toBe('AAPL');
        expect(state.horizons).toHaveLength(1);
        expect(state.trailingTwelveMonthsActuals).toEqual({ totalDebt: '$120', shareholdersEquity: '$60' });
        expect(state.errorKind).toBeNull();
    });

    it('treats an empty horizon list as a successful but empty analysis', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { data: { ticker: 'ZZZZ', horizons: [] } })));

        const store = makeStore();
        await store.dispatch(fetchDebtToEquity('ZZZZ'));
        const state = store.getState().debtToEquity;

        expect(state.status).toBe('succeeded');
        expect(state.horizons).toEqual([]);
    });

    it('classifies a not-found upstream response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(jsonResponse(404, { error: { message: 'Company not found' } })),
        );

        const store = makeStore();
        await store.dispatch(fetchDebtToEquity('MISS'));
        const state = store.getState().debtToEquity;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('not-found');
        expect(state.errorMessage).toBe('Company not found');
        expect(state.horizons).toEqual([]);
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetchDebtToEquity('AAPL'));
        const state = store.getState().debtToEquity;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
    });

    it('clears any previous error while a new request is in flight', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const store = makeStore();
        await store.dispatch(fetchDebtToEquity('AAPL'));
        expect(store.getState().debtToEquity.errorKind).toBe('network');

        let resolveFetch: (value: unknown) => void = () => undefined;
        vi.stubGlobal(
            'fetch',
            vi.fn().mockReturnValue(new Promise((resolve) => {
                resolveFetch = resolve;
            })),
        );

        const pending = store.dispatch(fetchDebtToEquity('AAPL'));
        expect(store.getState().debtToEquity.status).toBe('loading');
        expect(store.getState().debtToEquity.errorKind).toBeNull();

        resolveFetch(jsonResponse(200, { data: { ticker: 'AAPL', horizons: [] } }));
        await pending;
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
