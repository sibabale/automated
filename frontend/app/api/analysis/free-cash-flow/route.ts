// [ APP > API > ANALYSIS > FREE CASH FLOW ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    CORRELATION_ID_HEADER,
    createCorrelationHeaders,
    resolveCorrelationId,
} from '@/lib/correlation-id';
// 1.2. END ..........................................................................................

// 1.3. CONFIGURATION ................................................................................
// Financial figures change during market hours, so this proxy must always run
// at request time rather than being prerendered or cached.
export const dynamic = 'force-dynamic';

// The backend origin is read on the server only. It is intentionally not a
// `NEXT_PUBLIC_` variable so the browser never learns where the API lives.
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
// 1.3. END ..........................................................................................

// 1.4. ROUTE HANDLER ................................................................................
/**
 * Forwards a free-cash-flow analysis request to the backend service.
 *
 * The browser calls this same-origin route so the backend origin and any
 * credentials it requires stay private to the server. The upstream status code
 * and JSON body are passed through unchanged.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    // 1.4.1. INPUT ..................................................................................
    const correlationId = resolveCorrelationId(request.headers.get(CORRELATION_ID_HEADER));
    const ticker = request.nextUrl.searchParams.get('ticker')?.trim() ?? '';

    if (!ticker) {
        return NextResponse.json(
            {
                correlationId,
                error: { message: 'Missing required query parameter: ticker' },
            },
            {
                headers: createCorrelationHeaders(correlationId),
                status: 400,
            },
        );
    }
    // 1.4.1. END ....................................................................................

    // 1.4.2. FORWARD ................................................................................
    const upstream = `${BACKEND_URL}/analysis/free-cash-flow?ticker=${encodeURIComponent(ticker)}`;

    try {
        const response = await fetch(upstream, {
            cache: 'no-store',
            headers: createCorrelationHeaders(correlationId, { accept: 'application/json' }),
        });

        const payload = await response.json();
        const upstreamCorrelationId = response.headers.get(CORRELATION_ID_HEADER) ?? correlationId;

        return NextResponse.json(payload, {
            headers: createCorrelationHeaders(upstreamCorrelationId),
            status: response.status,
        });
    } catch {
        return NextResponse.json(
            {
                correlationId,
                error: { message: 'The analysis service is unavailable. Please try again shortly.' },
            },
            {
                headers: createCorrelationHeaders(correlationId),
                status: 502,
            },
        );
    }
    // 1.4.2. END ....................................................................................
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
