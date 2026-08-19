// [ APP > API > VERSIONED PROXY > TESTS ] ###########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { GET, POST } from './route';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const request = (url: string, correlationId = 'cid-from-browser') =>
    new NextRequest(url, {
        headers: { 'x-correlation-id': correlationId },
    });
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('versioned proxy route', () => {
    it('forwards versioned GET requests to the matching backend API version', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ data: { reportHeader: { ticker: 'AAPL' }, metrics: [] } }),
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'x-correlation-id': 'cid-from-backend',
                },
            },
        ));
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/v2/overview?ticker=AAPL'), {
            params: Promise.resolve({ version: 'v2', endpoint: ['overview'] }),
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/v2/overview?ticker=AAPL'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-from-browser',
                }),
            }),
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-backend');
    });

    it('rejects unsupported API versions', async () => {
        const response = await GET(request('http://localhost/api/v3/overview?ticker=AAPL'), {
            params: Promise.resolve({ version: 'v3', endpoint: ['overview'] }),
        });

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({ error: { message: 'Unsupported API version.' } });
    });

    it('rejects invalid POST request bodies before proxying', async () => {
        const response = await POST(new NextRequest('http://localhost/api/v1/trades/buy', {
            method: 'POST',
            body: JSON.stringify(['bad-payload']),
            headers: { 'content-type': 'application/json', 'x-correlation-id': 'cid-buy-001' },
        }), {
            params: Promise.resolve({ version: 'v1', endpoint: ['trades', 'buy'] }),
        });

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({
            error: { message: 'The buy request body must be a JSON object.' },
        });
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
