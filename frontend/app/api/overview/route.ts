// [ APP > API > OVERVIEW ] ##########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    CORRELATION_ID_HEADER,
    readOrCreateCorrelationId,
} from '../../../lib/correlation-id';
// 1.2. END ..........................................................................................

// 1.3. CONFIGURATION ................................................................................
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
// 1.3. END ..........................................................................................

// 1.4. ROUTE HANDLER ................................................................................
/**
 * Forwards a company overview request to the backend service.
 *
 * The browser calls this same-origin route so the backend origin stays private
 * to the server. The correlation id is forwarded and echoed back so the browser,
 * proxy, and backend request share one trace.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const correlationId = readOrCreateCorrelationId(request.headers);
    const ticker = request.nextUrl.searchParams.get('ticker')?.trim() ?? '';

    if (!ticker) {
        return NextResponse.json(
            { error: { message: 'Missing required query parameter: ticker' } },
            { status: 400, headers: { [CORRELATION_ID_HEADER]: correlationId } },
        );
    }

    const upstream = `${BACKEND_URL}/overview?ticker=${encodeURIComponent(ticker)}`;

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
            { error: { message: 'The overview service is unavailable. Please try again shortly.' } },
            { status: 502, headers: { [CORRELATION_ID_HEADER]: correlationId } },
        );
    }
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
