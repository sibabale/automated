// [ REDUX > SLICES > FREE CASH FLOW > TESTS ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { CORRELATION_ID_HEADER } from '../../lib/correlation-id';
import reducer, { fetchFreeCashFlow } from './free-cash-flow.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { freeCashFlow: reducer } });

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

describe('freeCashFlow slice', () => {
    it('stores the ticker and horizons on a successful analysis', async () => {
        const horizons = [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '$10.0B',
                breakdown: [{ period: '2024', value: '$10.0B' }],
                trend: 'up' as const,
            },
        ];
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: { ticker: 'RDDT', horizons } }));
        vi.stubGlobal('fetch', fetchMock);

        const store = makeStore();
        await store.dispatch(fetchFreeCashFlow('RDDT'));
        const state = store.getState().freeCashFlow;

        expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get(CORRELATION_ID_HEADER)).toEqual(expect.any(String));
        expect(state.status).toBe('succeeded');
        expect(state.ticker).toBe('RDDT');
        expect(state.horizons).toHaveLength(1);
        expect(state.errorKind).toBeNull();
    });

    it('treats an empty horizon list as a successful but empty analysis', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { data: { ticker: 'ZZZZ', horizons: [] } })));

        const store = makeStore();
        await store.dispatch(fetchFreeCashFlow('ZZZZ'));
        const state = store.getState().freeCashFlow;

        expect(state.status).toBe('succeeded');
        expect(state.horizons).toEqual([]);
    });

    it('classifies a timeout upstream response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(jsonResponse(504, { error: { message: 'Request timed out' } })),
        );

        const store = makeStore();
        await store.dispatch(fetchFreeCashFlow('RDDT'));
        const state = store.getState().freeCashFlow;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('timeout');
        expect(state.errorMessage).toBe('Request timed out');
        expect(state.horizons).toEqual([]);
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetchFreeCashFlow('RDDT'));
        const state = store.getState().freeCashFlow;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
    });

    it('clears any previous error while a new request is in flight', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const store = makeStore();
        await store.dispatch(fetchFreeCashFlow('RDDT'));
        expect(store.getState().freeCashFlow.errorKind).toBe('network');

        let resolveFetch: (value: unknown) => void = () => undefined;
        vi.stubGlobal(
            'fetch',
            vi.fn().mockReturnValue(new Promise((resolve) => {
                resolveFetch = resolve;
            })),
        );

        const pending = store.dispatch(fetchFreeCashFlow('RDDT'));
        expect(store.getState().freeCashFlow.status).toBe('loading');
        expect(store.getState().freeCashFlow.errorKind).toBeNull();

        resolveFetch(jsonResponse(200, { data: { ticker: 'RDDT', horizons: [] } }));
        await pending;
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
