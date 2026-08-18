// [ APP > API > TRADES > BUY > TESTS ] ##############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { POST } from './route';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const request = (
    body: unknown,
    correlationId = 'cid-from-browser',
) => new NextRequest('http://localhost/api/trades/buy', {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'x-correlation-id': correlationId,
    },
    body: JSON.stringify(body),
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('buy trade proxy route', () => {
    it('rejects a non-object request body and preserves the correlation id header', async () => {
        const response = await POST(request('invalid'));

        expect(response.status).toBe(400);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-browser');
        await expect(response.json()).resolves.toMatchObject({
            error: { message: 'The buy request body must be a JSON object.' },
        });
    });

    it('forwards the buy payload and correlation id to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({
                data: {
                    order: {
                        clientOrderId: 'paper-buy-001',
                        ticker: 'MSFT',
                    },
                },
            }),
            {
                status: 201,
                headers: {
                    'content-type': 'application/json',
                    'x-correlation-id': 'cid-from-backend',
                },
            },
        ));
        vi.stubGlobal('fetch', fetchMock);

        const response = await POST(request({
            ticker: 'MSFT',
            quantity: 2,
            mode: 'paper',
            side: 'buy',
            orderType: 'market',
        }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/trades/buy'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-correlation-id': 'cid-from-browser',
                }),
                body: JSON.stringify({
                    ticker: 'MSFT',
                    quantity: 2,
                    mode: 'paper',
                    side: 'buy',
                    orderType: 'market',
                }),
            }),
        );
        expect(response.status).toBe(201);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-backend');
        await expect(response.json()).resolves.toMatchObject({
            data: { order: { clientOrderId: 'paper-buy-001', ticker: 'MSFT' } },
        });
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await POST(request({
            ticker: 'MSFT',
            quantity: 2,
            mode: 'paper',
            side: 'buy',
            orderType: 'market',
        }));

        expect(response.status).toBe(502);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-browser');
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
