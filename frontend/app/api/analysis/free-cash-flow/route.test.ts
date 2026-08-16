// [ APP > API > ANALYSIS > FREE CASH FLOW > TESTS ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { CORRELATION_ID_HEADER } from '@/lib/correlation-id';
import { GET } from './route';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const request = (url: string, correlationId = 'cid-free-cash-flow') =>
    new NextRequest(url, { headers: { [CORRELATION_ID_HEADER]: correlationId } });
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('free cash flow proxy route', () => {
    it('rejects a request without a ticker', async () => {
        const response = await GET(request('http://localhost/api/analysis/free-cash-flow'));

        expect(response.status).toBe(400);
        expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('cid-free-cash-flow');
        await expect(response.json()).resolves.toMatchObject({
            correlationId: 'cid-free-cash-flow',
            error: { message: expect.any(String) },
        });
    });

    it('forwards the ticker and correlation id to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            headers: new Headers({ [CORRELATION_ID_HEADER]: 'cid-upstream-fcf' }),
            status: 200,
            json: async () => ({ correlationId: 'cid-upstream-fcf', data: { ticker: 'RDDT', horizons: [] } }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/analysis/free-cash-flow?ticker=rddt', 'cid-client-fcf'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0]?.[0]).toContain('ticker=rddt');
        expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get(CORRELATION_ID_HEADER)).toBe('cid-client-fcf');
        expect(response.status).toBe(200);
        expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('cid-upstream-fcf');
        await expect(response.json()).resolves.toMatchObject({
            correlationId: 'cid-upstream-fcf',
            data: { ticker: 'RDDT' },
        });
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await GET(request('http://localhost/api/analysis/free-cash-flow?ticker=RDDT'));

        expect(response.status).toBe(502);
        expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('cid-free-cash-flow');
        await expect(response.json()).resolves.toMatchObject({
            correlationId: 'cid-free-cash-flow',
            error: { message: expect.any(String) },
        });
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
