// [ FRONTEND > LIB > CORRELATION ID ] ###############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. CONSTANTS ....................................................................................
export const CORRELATION_ID_HEADER = 'x-correlation-id';
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
/**
 * Creates a request correlation id for frontend-to-backend tracing.
 *
 * Modern browsers and the Next.js runtime expose `crypto.randomUUID()`. The
 * fallback keeps tests and older runtimes functional without pulling in a
 * heavier UUID dependency for a simple tracing token.
 */
export function createCorrelationId(): string {
    const randomUuid = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);

    if (randomUuid) {
        return randomUuid();
    }

    return `cid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Reuses an inbound correlation id when present, otherwise creates one.
 */
export function resolveCorrelationId(inbound: string | null | undefined): string {
    const trimmed = inbound?.trim();

    return trimmed ? trimmed : createCorrelationId();
}

/**
 * Adds the correlation-id header to an outgoing request or response header set.
 */
export function createCorrelationHeaders(correlationId: string, headers?: HeadersInit): Headers {
    const mergedHeaders = new Headers(headers);
    mergedHeaders.set(CORRELATION_ID_HEADER, correlationId);

    return mergedHeaders;
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
