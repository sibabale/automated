// [ REDUX > SLICES > RUNS > TESTS ] #################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetchRuns } from './runs.slice';
// 1.2. END ..........................................................................................

const makeStore = () => configureStore({ reducer: { runs: reducer } });

afterEach(() => {
    vi.restoreAllMocks();
});

describe('runs slice', () => {
    it('stores paginated items on success', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                data: {
                    page: 1,
                    pageSize: 10,
                    totalItems: 1,
                    totalPages: 1,
                    items: [
                        {
                            apiVersion: 'v1',
                            ticker: 'AAPL',
                            companyName: 'Apple Inc.',
                            batchId: 'batch-1',
                            sourceFile: 'ticker.json',
                            processedAt: '2026-08-19T10:00:00.000Z',
                            status: 'reject',
                            scoreAtPurchase: 72,
                            analysisModel: 'automated-investment-v1',
                            constitutionVersion: 'all-five-metrics-must-be-strong',
                        },
                    ],
                },
            }),
        }));

        const store = makeStore();
        await store.dispatch(fetchRuns({ page: 1 }));

        expect(store.getState().runs.status).toBe('succeeded');
        expect(store.getState().runs.items).toHaveLength(1);
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
