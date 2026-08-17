// [ APP > API > ANALYSIS > MARGIN OF SAFETY > TESTS ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { GET } from './route';
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

describe('margin of safety proxy route', () => {
    it('rejects a request without a ticker and preserves the correlation id header', async () => {
        const response = await GET(request('http://localhost/api/analysis/margin-of-safety'));

        expect(response.status).toBe(400);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-browser');
        await expect(response.json()).resolves.toMatchObject({ error: { message: expect.any(String) } });
    });

    it('forwards the ticker and correlation id to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ data: { ticker: 'AAPL', horizons: [] } }),
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'x-correlation-id': 'cid-from-backend',
                },
            },
        ));
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/analysis/margin-of-safety?ticker=aapl'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('ticker=aapl'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-from-browser',
                }),
            }),
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-backend');
        await expect(response.json()).resolves.toMatchObject({ data: { ticker: 'AAPL' } });
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await GET(request('http://localhost/api/analysis/margin-of-safety?ticker=AAPL'));

        expect(response.status).toBe(502);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-browser');
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
