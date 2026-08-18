// [ REDUX > SLICES > PORTFOLIO > TESTS ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetchPortfolio } from './portfolio.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { portfolio: reducer } });

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

describe('portfolio slice', () => {
    it('stores the fetched summary and holdings on success', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-portfolio-001');
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                mode: 'paper',
                summary: {
                    totalValue: '$1260.00',
                    totalInvested: '$1200.00',
                    totalGainLoss: '$60.00',
                    totalGainPercentage: '5.0%',
                    averageScoreAtPurchase: '92.0',
                },
                positions: [
                    {
                        companyName: 'Microsoft Corporation',
                        ticker: 'MSFT',
                        quantity: 3,
                        averageEntryPrice: '$400.00',
                        currentPrice: '$420.00',
                        marketValue: '$1260.00',
                        unrealizedGainLoss: '$60.00',
                        scoreAtPurchase: '92.0',
                    },
                ],
            },
        }));
        vi.stubGlobal('fetch', fetchMock);

        const store = makeStore();
        await store.dispatch(fetchPortfolio('paper'));
        const state = store.getState().portfolio;

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/portfolio?mode=paper',
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-portfolio-001',
                }),
            }),
        );
        expect(state.status).toBe('succeeded');
        expect(state.mode).toBe('paper');
        expect(state.summary).toEqual({
            totalValue: '$1260.00',
            totalInvested: '$1200.00',
            totalGainLoss: '+$60.00',
            totalGainPercentage: '5.0%',
            averageScore: '92.0',
        });
        expect(state.holdings).toEqual([
            {
                company: 'Microsoft Corporation',
                ticker: 'MSFT',
                shares: '3',
                averageBuy: '$400.00',
                current: '$420.00',
                value: '$1260.00',
                gainLoss: '+$60.00',
                score: '92.0',
            },
        ]);
    });

    it('treats missing score and zero gain loss as visible fallback values', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                mode: 'paper',
                summary: {
                    totalValue: '$0.00',
                    totalInvested: '$0.00',
                    totalGainLoss: '$0.00',
                    totalGainPercentage: null,
                    averageScoreAtPurchase: null,
                },
                positions: [
                    {
                        companyName: null,
                        ticker: 'MSFT',
                        quantity: 0,
                        averageEntryPrice: null,
                        currentPrice: null,
                        marketValue: null,
                        unrealizedGainLoss: '$0.00',
                        scoreAtPurchase: null,
                    },
                ],
            },
        })));

        const store = makeStore();
        await store.dispatch(fetchPortfolio('paper'));
        const state = store.getState().portfolio;

        expect(state.holdings[0]).toEqual({
            company: '—',
            ticker: 'MSFT',
            shares: '0',
            averageBuy: '—',
            current: '—',
            value: '—',
            gainLoss: '$0.00',
            score: '—',
        });
        expect(state.summary).toEqual({
            totalValue: '$0.00',
            totalInvested: '$0.00',
            totalGainLoss: '$0.00',
            totalGainPercentage: null,
            averageScore: null,
        });
    });

    it('normalizes negative gain loss values so they never render with both plus and minus signs', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {
            data: {
                mode: 'paper',
                summary: {
                    totalValue: '$121.53',
                    totalInvested: '$1000.00',
                    totalGainLoss: '$-878.47',
                    totalGainPercentage: '-87.8%',
                    averageScoreAtPurchase: null,
                },
                positions: [
                    {
                        companyName: 'Microsoft Corporation',
                        ticker: 'MSFT',
                        quantity: 3,
                        averageEntryPrice: '$333.33',
                        currentPrice: '$40.51',
                        marketValue: '$121.53',
                        unrealizedGainLoss: '$-878.47',
                        scoreAtPurchase: null,
                    },
                ],
            },
        })));

        const store = makeStore();
        await store.dispatch(fetchPortfolio('paper'));
        const state = store.getState().portfolio;

        expect(state.holdings[0]?.gainLoss).toBe('−$878.47');
        expect(state.summary?.totalGainLoss).toBe('−$878.47');
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetchPortfolio('paper'));
        const state = store.getState().portfolio;

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
        expect(state.errorMessage).toBe('We could not reach the portfolio service. Check your connection and try again.');
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
