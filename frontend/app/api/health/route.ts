// [ APP > API > HEALTH ] ##############################################################################

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
// 1.3. END ..........................................................................................

// 1.4. ROUTE HANDLER ................................................................................
export async function GET(request: NextRequest): Promise<NextResponse> {
    const correlationId = readOrCreateCorrelationId(request.headers);

    return NextResponse.json(
        { status: 'ok', correlationId, service: 'frontend' },
        { status: 200, headers: { [CORRELATION_ID_HEADER]: correlationId } },
    );
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
