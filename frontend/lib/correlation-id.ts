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
 * Creates a correlation id for one logical client request.
 *
 * Web Crypto is preferred because both browsers and Next route handlers expose
 * it. The timestamp fallback keeps tests and unusual runtimes working even when
 * `randomUUID` is unavailable.
 */
export const createCorrelationId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Reuses an inbound correlation id header when present, otherwise creates one.
 */
export const readOrCreateCorrelationId = (headers: Headers): string => {
    const inbound = headers.get(CORRELATION_ID_HEADER)?.trim() ?? '';

    return inbound.length > 0 ? inbound : createCorrelationId();
};
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
