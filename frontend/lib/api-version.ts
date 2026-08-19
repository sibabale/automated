// [ FRONTEND > LIB > API VERSION ] ##################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export const SUPPORTED_API_VERSIONS = ['v1', 'v2'] as const;

export type ApiVersion = (typeof SUPPORTED_API_VERSIONS)[number];

export const DEFAULT_FRONTEND_API_VERSION: ApiVersion = 'v1';
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
export function isApiVersion(value: string): value is ApiVersion {
    return SUPPORTED_API_VERSIONS.includes(value as ApiVersion);
}

export function readFrontendApiVersion(): ApiVersion {
    const configuredVersion = process.env.NEXT_PUBLIC_API_VERSION?.trim();

    if (configuredVersion && isApiVersion(configuredVersion)) {
        return configuredVersion;
    }

    return DEFAULT_FRONTEND_API_VERSION;
}

export function buildVersionedFrontendApiPath(path: string, apiVersion = readFrontendApiVersion()): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `/api/${apiVersion}${normalizedPath}`;
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
