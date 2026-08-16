// [ APP > API > ANALYSIS > RETURN ON EQUITY > TESTS ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { CORRELATION_ID_HEADER } from '@/lib/correlation-id';
import { GET } from './route';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const request = (url: string, correlationId = 'cid-return-on-equity') =>
    new NextRequest(url, { headers: { [CORRELATION_ID_HEADER]: correlationId } });
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('return on equity proxy route', () => {
    it('rejects a request without a ticker', async () => {
        const response = await GET(request('http://localhost/api/analysis/return-on-equity'));

        expect(response.status).toBe(400);
        expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('cid-return-on-equity');
        await expect(response.json()).resolves.toMatchObject({
            correlationId: 'cid-return-on-equity',
            error: { message: expect.any(String) },
        });
    });

    it('forwards the ticker and correlation id to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            headers: new Headers({ [CORRELATION_ID_HEADER]: 'cid-upstream-roe' }),
            status: 200,
            json: async () => ({ correlationId: 'cid-upstream-roe', data: { ticker: 'AAPL', horizons: [] } }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/analysis/return-on-equity?ticker=aapl', 'cid-client-roe'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0]?.[0]).toContain('ticker=aapl');
        expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get(CORRELATION_ID_HEADER)).toBe('cid-client-roe');
        expect(response.status).toBe(200);
        expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('cid-upstream-roe');
        await expect(response.json()).resolves.toMatchObject({
            correlationId: 'cid-upstream-roe',
            data: { ticker: 'AAPL' },
        });
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await GET(request('http://localhost/api/analysis/return-on-equity?ticker=AAPL'));

        expect(response.status).toBe(502);
        expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('cid-return-on-equity');
        await expect(response.json()).resolves.toMatchObject({
            correlationId: 'cid-return-on-equity',
            error: { message: expect.any(String) },
        });
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
