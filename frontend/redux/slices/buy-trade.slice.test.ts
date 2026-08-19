// [ REDUX > SLICES > BUY TRADE > TESTS ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import reducer, { submitBuyTrade } from './buy-trade.slice';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('buyTrade slice', () => {
    it('submits a paper market order with the current ticker and quantity', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-buy-001');
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    order: {
                        averageFillPrice: null,
                        broker: 'alpaca',
                        brokerOrderId: 'broker-001',
                        clientOrderId: 'paper-buy-001',
                        filledQuantity: null,
                        mode: 'paper',
                        orderType: 'market',
                        quantity: 3,
                        status: 'accepted',
                        submittedAt: '2026-08-18T10:00:00.000Z',
                        ticker: 'MSFT',
                    },
                },
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const dispatch = vi.fn();
        const rejectWithValue = vi.fn();

        const result = await submitBuyTrade({ quantity: 3, ticker: 'MSFT' })(
            dispatch,
            () => ({}),
            undefined,
        );

        expect(fetchMock).toHaveBeenCalledWith('/api/v1/trades/buy', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-correlation-id': 'cid-buy-001',
            },
            body: JSON.stringify({
                mode: 'paper',
                orderType: 'market',
                quantity: 3,
                side: 'buy',
                ticker: 'MSFT',
            }),
        });
        expect(rejectWithValue).not.toHaveBeenCalled();
        expect(result.payload).toMatchObject({
            clientOrderId: 'paper-buy-001',
            ticker: 'MSFT',
            quantity: 3,
        });
    });

    it('stores a successful paper trade submission', () => {
        const state = reducer(undefined, {
            type: submitBuyTrade.fulfilled.type,
            payload: {
                averageFillPrice: null,
                broker: 'alpaca',
                brokerOrderId: 'broker-001',
                clientOrderId: 'paper-buy-001',
                filledQuantity: null,
                mode: 'paper',
                orderType: 'market',
                quantity: 3,
                status: 'accepted',
                submittedAt: '2026-08-18T10:00:00.000Z',
                ticker: 'MSFT',
            },
        });

        expect(state.status).toBe('succeeded');
        expect(state.lastOrder).toMatchObject({
            clientOrderId: 'paper-buy-001',
            quantity: 3,
            ticker: 'MSFT',
        });
        expect(state.errorMessage).toBeNull();
    });

    it('stores the backend message when the paper trade request fails', () => {
        const state = reducer(undefined, {
            type: submitBuyTrade.rejected.type,
            payload: {
                kind: 'validation',
                message: 'Quantity must be greater than zero.',
            },
        });

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('validation');
        expect(state.errorMessage).toBe('Quantity must be greater than zero.');
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
