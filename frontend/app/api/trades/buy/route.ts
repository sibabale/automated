// [ APP > API > TRADES > BUY ] ######################################################################

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
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
// 1.3. END ..........................................................................................

// 1.4. ROUTE HANDLER ................................................................................
export async function POST(request: NextRequest): Promise<NextResponse> {
    const correlationId = readOrCreateCorrelationId(request.headers);
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json(
            { error: { message: 'The buy request body must be a JSON object.' } },
            { status: 400, headers: { [CORRELATION_ID_HEADER]: correlationId } },
        );
    }

    try {
        const response = await fetch(`${BACKEND_URL}/trades/buy`, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                [CORRELATION_ID_HEADER]: correlationId,
            },
            body: JSON.stringify(body),
        });

        const payload = await response.json();
        const forwardedCorrelationId = response.headers.get(CORRELATION_ID_HEADER) ?? correlationId;

        return NextResponse.json(payload, {
            status: response.status,
            headers: { [CORRELATION_ID_HEADER]: forwardedCorrelationId },
        });
    } catch {
        return NextResponse.json(
            { error: { message: 'The trade service is unavailable. Please try again shortly.' } },
            { status: 502, headers: { [CORRELATION_ID_HEADER]: correlationId } },
        );
    }
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
