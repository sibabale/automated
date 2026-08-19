// [ REDUX > SLICES > MARGIN OF SAFETY > TESTS ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetchMarginOfSafety } from './margin-of-safety.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { marginOfSafety: reducer } });

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

describe('marginOfSafety slice', () => {
    it('stores the current snapshot summary and actuals on a successful analysis', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-mos-001');
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                ticker: 'AAPL',
                horizons: [],
                consolidatedSummary: { values: ['20.0%'], result: '20.0%', denominator: '1' },
                trailingTwelveMonthsActuals: { intrinsicValue: '$250.00', stockPrice: '$200.00' },
            },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const store = makeStore();
        await store.dispatch(fetchMarginOfSafety('AAPL'));
        const state = store.getState().marginOfSafety;

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/analysis/margin-of-safety?ticker=AAPL',
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-mos-001',
                }),
            }),
        );
        expect(state.status).toBe('succeeded');
        expect(state.ticker).toBe('AAPL');
        expect(state.horizons).toEqual([]);
        expect(state.consolidatedSummary).toEqual({
            values: ['20.0%'],
            result: '20.0%',
            denominator: '1',
        });
        expect(state.trailingTwelveMonthsActuals).toEqual({
            intrinsicValue: '$250.00',
            stockPrice: '$200.00',
        });
        expect(state.errorKind).toBeNull();
    });

    it('treats an empty current snapshot summary as a successful but empty analysis', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                ticker: 'ZZZZ',
                horizons: [],
                consolidatedSummary: { values: [], result: '—', denominator: '0' },
                trailingTwelveMonthsActuals: { intrinsicValue: '—', stockPrice: '—' },
            },
        })));

        const store = makeStore();
        await store.dispatch(fetchMarginOfSafety('ZZZZ'));
        const state = store.getState().marginOfSafety;

        expect(state.status).toBe('succeeded');
        expect(state.horizons).toEqual([]);
        expect(state.consolidatedSummary).toEqual({
            values: [],
            result: '—',
            denominator: '0',
        });
    });

    it('classifies a rate-limit upstream response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(jsonResponse(429, { error: { message: 'Too many requests' } })),
        );

        const store = makeStore();
        await store.dispatch(fetchMarginOfSafety('AAPL'));
        const state = store.getState().marginOfSafety;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('rate-limit');
        expect(state.errorMessage).toBe('Too many requests');
        expect(state.horizons).toEqual([]);
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetchMarginOfSafety('AAPL'));
        const state = store.getState().marginOfSafety;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
    });

    it('clears any previous error while a new request is in flight', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const store = makeStore();
        await store.dispatch(fetchMarginOfSafety('AAPL'));
        expect(store.getState().marginOfSafety.errorKind).toBe('network');

        let resolveFetch: (value: unknown) => void = () => undefined;
        vi.stubGlobal(
            'fetch',
            vi.fn().mockReturnValue(new Promise((resolve) => {
                resolveFetch = resolve;
            })),
        );

        const pending = store.dispatch(fetchMarginOfSafety('AAPL'));
        expect(store.getState().marginOfSafety.status).toBe('loading');
        expect(store.getState().marginOfSafety.errorKind).toBeNull();

        resolveFetch(jsonResponse(200, {
            data: {
                ticker: 'AAPL',
                horizons: [],
                consolidatedSummary: { values: ['20.0%'], result: '20.0%', denominator: '1' },
                trailingTwelveMonthsActuals: { intrinsicValue: '$250.00', stockPrice: '$200.00' },
            },
        }));
        await pending;
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
