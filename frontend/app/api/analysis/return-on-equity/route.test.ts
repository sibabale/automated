// [ APP > API > ANALYSIS > RETURN ON EQUITY > TESTS ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { GET } from './route';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const request = (url: string) => new NextRequest(url);
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('return on equity proxy route', () => {
    it('rejects a request without a ticker', async () => {
        const response = await GET(request('http://localhost/api/analysis/return-on-equity'));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { message: expect.any(String) } });
    });

    it('forwards the ticker to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            status: 200,
            json: async () => ({ data: { ticker: 'AAPL', horizons: [] } }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/analysis/return-on-equity?ticker=aapl'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toContain('ticker=aapl');
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ data: { ticker: 'AAPL' } });
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await GET(request('http://localhost/api/analysis/return-on-equity?ticker=AAPL'));

        expect(response.status).toBe(502);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
