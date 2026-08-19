// [ APP > API > VERSIONED PROXY ] ###################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    CORRELATION_ID_HEADER,
    readOrCreateCorrelationId,
} from '../../../../lib/correlation-id';
import { isApiVersion } from '../../../../lib/api-version';
// 1.2. END ..........................................................................................

// 1.3. CONFIGURATION ................................................................................
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
// 1.3. END ..........................................................................................

// 1.4. TYPES ........................................................................................
interface RouteContext {
    params: Promise<{
        version: string;
        endpoint?: string[];
    }>;
}
// 1.4. END ..........................................................................................

// 1.5. HELPERS ......................................................................................
function unsupportedVersionResponse(correlationId: string): NextResponse {
    return NextResponse.json(
        { error: { message: 'Unsupported API version.' } },
        { status: 404, headers: { [CORRELATION_ID_HEADER]: correlationId } },
    );
}

function missingEndpointResponse(correlationId: string): NextResponse {
    return NextResponse.json(
        { error: { message: 'Missing API endpoint path.' } },
        { status: 404, headers: { [CORRELATION_ID_HEADER]: correlationId } },
    );
}

function unavailableResponse(correlationId: string): NextResponse {
    return NextResponse.json(
        { error: { message: 'The API service is unavailable. Please try again shortly.' } },
        { status: 502, headers: { [CORRELATION_ID_HEADER]: correlationId } },
    );
}

function invalidBodyResponse(correlationId: string, endpoint: string[]): NextResponse {
    const endpointPath = endpoint.join('/');
    const message = endpointPath === 'trades/buy'
        ? 'The buy request body must be a JSON object.'
        : 'The request body must be a JSON object.';

    return NextResponse.json(
        { error: { message } },
        { status: 400, headers: { [CORRELATION_ID_HEADER]: correlationId } },
    );
}
// 1.5. END ..........................................................................................

// 1.6. ROUTE HANDLERS ...............................................................................
async function proxyVersionedRequest(
    request: NextRequest,
    context: RouteContext,
    method: 'GET' | 'POST',
): Promise<NextResponse> {
    const correlationId = readOrCreateCorrelationId(request.headers);
    const { version, endpoint = [] } = await context.params;

    if (!isApiVersion(version)) {
        return unsupportedVersionResponse(correlationId);
    }

    if (endpoint.length === 0) {
        return missingEndpointResponse(correlationId);
    }

    const upstream = `${BACKEND_URL}/api/${version}/${endpoint.join('/')}${request.nextUrl.search}`;
    const headers: HeadersInit = {
        accept: 'application/json',
        [CORRELATION_ID_HEADER]: correlationId,
    };

    let body: string | undefined;

    if (method === 'POST') {
        const payload = await request.json().catch(() => null);

        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return invalidBodyResponse(correlationId, endpoint);
        }

        headers['content-type'] = 'application/json';
        body = JSON.stringify(payload);
    }

    try {
        const response = await fetch(upstream, {
            method,
            cache: 'no-store',
            headers,
            body,
        });

        const payload = await response.json();
        const forwardedCorrelationId = response.headers.get(CORRELATION_ID_HEADER) ?? correlationId;

        return NextResponse.json(payload, {
            status: response.status,
            headers: { [CORRELATION_ID_HEADER]: forwardedCorrelationId },
        });
    } catch {
        return unavailableResponse(correlationId);
    }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
    return proxyVersionedRequest(request, context, 'GET');
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
    return proxyVersionedRequest(request, context, 'POST');
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
