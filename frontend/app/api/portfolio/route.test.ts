// [ APP > API > PORTFOLIO > TESTS ] #################################################################

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

describe('portfolio proxy route', () => {
    it('forwards the mode and correlation id to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ data: { mode: 'paper', positions: [], summary: { totalValue: '$0.00' } } }),
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'x-correlation-id': 'cid-from-backend',
                },
            },
        ));
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/portfolio?mode=paper'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/portfolio?mode=paper'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    accept: 'application/json',
                    'x-correlation-id': 'cid-from-browser',
                }),
            }),
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-backend');
        await expect(response.json()).resolves.toMatchObject({ data: { mode: 'paper' } });
    });

    it('defaults to paper mode when no mode is provided', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ data: { mode: 'paper', positions: [], summary: { totalValue: '$0.00' } } }),
            { status: 200, headers: { 'content-type': 'application/json' } },
        ));
        vi.stubGlobal('fetch', fetchMock);

        await GET(request('http://localhost/api/portfolio'));

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/portfolio?mode=paper'),
            expect.any(Object),
        );
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await GET(request('http://localhost/api/portfolio?mode=paper'));

        expect(response.status).toBe(502);
        expect(response.headers.get('x-correlation-id')).toBe('cid-from-browser');
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
