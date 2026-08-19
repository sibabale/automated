// [ REDUX > SLICES > OVERVIEW > TESTS ] #############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetchOverview } from './overview.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { overview: reducer } });

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

describe('overview slice', () => {
    it('stores the fetched report header and metric values on success', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-overview-001');
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                reportHeader: {
                    companyName: 'Microsoft Corporation',
                    industry: 'Software',
                    sector: 'Technology',
                    sharePrice: '$512.34 USD',
                    ticker: 'MSFT',
                },
                metrics: [
                    { slug: 'return-on-equity', value: '35.0%' },
                ],
            },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const store = makeStore();
        await store.dispatch(fetchOverview('MSFT'));
        const state = store.getState().overview;

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/overview?ticker=MSFT',
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-overview-001',
                }),
            }),
        );
        expect(state.status).toBe('succeeded');
        expect(state.ticker).toBe('MSFT');
        expect(state.reportHeader).toEqual({
            companyName: 'Microsoft Corporation',
            industry: 'Software',
            sector: 'Technology',
            sharePrice: '$512.34 USD',
            ticker: 'MSFT',
        });
        expect(state.metrics).toEqual([{ slug: 'return-on-equity', value: '35.0%' }]);
    });

    it('classifies a not-found response and clears stale overview data', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce(jsonResponse(200, {
                data: {
                    reportHeader: {
                        companyName: 'Apple Inc.',
                        industry: 'Consumer Electronics',
                        sector: 'Technology',
                        sharePrice: '$184.25 USD',
                        ticker: 'AAPL',
                    },
                    metrics: [{ slug: 'return-on-equity', value: '25.0%' }],
                },
            }))
            .mockResolvedValueOnce(jsonResponse(404, { error: { message: 'Company not found' } })));

        const store = makeStore();
        await store.dispatch(fetchOverview('AAPL'));
        await store.dispatch(fetchOverview('MISS'));
        const state = store.getState().overview;

        expect(state.status).toBe('failed');
        expect(state.ticker).toBe('MISS');
        expect(state.errorKind).toBe('not-found');
        expect(state.errorMessage).toBe('Company not found');
        expect(state.metrics).toEqual([]);
        expect(state.reportHeader).toBeNull();
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetchOverview('AAPL'));
        const state = store.getState().overview;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
        expect(state.errorMessage).toBe('We could not reach the overview service. Check your connection and try again.');
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
