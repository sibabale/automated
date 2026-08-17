// [ APP > API > ANALYSIS > RETURN ON EQUITY ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    CORRELATION_ID_HEADER,
    readOrCreateCorrelationId,
} from '../../../../lib/correlation-id';
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
 * Forwards a return-on-equity analysis request to the backend service.
 *
 * The browser calls this same-origin route so the backend origin and any
 * credentials it requires stay private to the server. The incoming correlation
 * id is forwarded to the backend and echoed back to the browser so one trace can
 * span the browser request, this proxy, and the backend service.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const correlationId = readOrCreateCorrelationId(request.headers);

    // 1.4.1. INPUT ..................................................................................
    const ticker = request.nextUrl.searchParams.get('ticker')?.trim() ?? '';

    if (!ticker) {
        return NextResponse.json(
            { error: { message: 'Missing required query parameter: ticker' } },
            { status: 400, headers: { [CORRELATION_ID_HEADER]: correlationId } },
        );
    }
    // 1.4.1. END ....................................................................................

    // 1.4.2. FORWARD ................................................................................
    const upstream = `${BACKEND_URL}/analysis/return-on-equity?ticker=${encodeURIComponent(ticker)}`;

    try {
        const response = await fetch(upstream, {
            cache: 'no-store',
            headers: {
                accept: 'application/json',
                [CORRELATION_ID_HEADER]: correlationId,
            },
        });

        const payload = await response.json();
        const forwardedCorrelationId = response.headers.get(CORRELATION_ID_HEADER) ?? correlationId;

        return NextResponse.json(payload, {
            status: response.status,
            headers: { [CORRELATION_ID_HEADER]: forwardedCorrelationId },
        });
    } catch {
        return NextResponse.json(
            { error: { message: 'The analysis service is unavailable. Please try again shortly.' } },
            { status: 502, headers: { [CORRELATION_ID_HEADER]: correlationId } },
        );
    }
    // 1.4.2. END ....................................................................................
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
