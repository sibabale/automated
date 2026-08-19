// [ REDUX > SLICES > PROFIT MARGIN > TESTS ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetchProfitMargin } from './profit-margin.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { profitMargin: reducer } });

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

describe('profitMargin slice', () => {
    it('stores the ticker, horizons, and actuals on a successful analysis', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-pm-001');
        const horizons = [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '25.0%',
                breakdown: [{ period: '2024', value: '25.0%' }],
                trend: 'up' as const,
            },
        ];
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                ticker: 'AAPL',
                horizons,
                consolidatedSummary: { values: ['25.0%'], result: '25.0%', denominator: '1' },
                trailingTwelveMonthsActuals: { netIncome: '$100', revenue: '$400' },
            },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const store = makeStore();
        await store.dispatch(fetchProfitMargin('AAPL'));
        const state = store.getState().profitMargin;

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/analysis/profit-margin?ticker=AAPL',
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-pm-001',
                }),
            }),
        );
        expect(state.status).toBe('succeeded');
        expect(state.ticker).toBe('AAPL');
        expect(state.horizons).toHaveLength(1);
        expect(state.trailingTwelveMonthsActuals).toEqual({ netIncome: '$100', revenue: '$400' });
        expect(state.errorKind).toBeNull();
    });

    it('treats an empty horizon list as a successful but empty analysis', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { data: { ticker: 'ZZZZ', horizons: [] } })));

        const store = makeStore();
        await store.dispatch(fetchProfitMargin('ZZZZ'));
        const state = store.getState().profitMargin;

        expect(state.status).toBe('succeeded');
        expect(state.horizons).toEqual([]);
    });

    it('classifies a rate-limit upstream response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(jsonResponse(429, { error: { message: 'Too many requests' } })),
        );

        const store = makeStore();
        await store.dispatch(fetchProfitMargin('AAPL'));
        const state = store.getState().profitMargin;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('rate-limit');
        expect(state.errorMessage).toBe('Too many requests');
        expect(state.horizons).toEqual([]);
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetchProfitMargin('AAPL'));
        const state = store.getState().profitMargin;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
    });

    it('clears any previous error while a new request is in flight', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const store = makeStore();
        await store.dispatch(fetchProfitMargin('AAPL'));
        expect(store.getState().profitMargin.errorKind).toBe('network');

        let resolveFetch: (value: unknown) => void = () => undefined;
        vi.stubGlobal(
            'fetch',
            vi.fn().mockReturnValue(new Promise((resolve) => {
                resolveFetch = resolve;
            })),
        );

        const pending = store.dispatch(fetchProfitMargin('AAPL'));
        expect(store.getState().profitMargin.status).toBe('loading');
        expect(store.getState().profitMargin.errorKind).toBeNull();

        resolveFetch(jsonResponse(200, { data: { ticker: 'AAPL', horizons: [] } }));
        await pending;
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
