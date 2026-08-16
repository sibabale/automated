// [ SCRIPTS > NEW METRIC LIB ] #######################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. CONSTANTS ....................................................................................
const REQUIRED_OPTIONS = ['slug', 'label'];

const DEFAULT_DESCRIPTION = 'TODO: add the metric summary copy.';
const DEFAULT_VALUE = 'TODO';
// 1.3. END ..........................................................................................

// 1.4. ARGUMENT PARSING .............................................................................
export function parseArgs(argv) {
    const options = {
        dryRun: false,
        noRegistry: false,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];

        if (!token.startsWith('--')) {
            throw new Error(`Unexpected positional argument: ${token}`);
        }

        const key = token.slice(2);

        if (key === 'dry-run') {
            options.dryRun = true;
            continue;
        }

        if (key === 'no-registry') {
            options.noRegistry = true;
            continue;
        }

        const value = argv[index + 1];

        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for --${key}`);
        }

        options[key] = value;
        index += 1;
    }

    for (const key of REQUIRED_OPTIONS) {
        if (!options[key]) {
            throw new Error(`Missing required option --${key}`);
        }
    }

    return options;
}
// 1.4. END ..........................................................................................

// 1.5. CONTEXT ......................................................................................
function toWords(slug) {
    return slug.split('-').filter(Boolean);
}

function toPascalCase(slug) {
    return toWords(slug)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join('');
}

function toCamelCase(slug) {
    const pascal = toPascalCase(slug);
    return pascal[0].toLowerCase() + pascal.slice(1);
}

function toUpperBreadcrumb(slug) {
    return toWords(slug)
        .join(' ')
        .toUpperCase();
}

function defaultAbbreviation(label) {
    return label
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
}

export function buildMetricContext(options) {
    const slug = String(options.slug).trim();

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`The slug "${slug}" must be kebab-case.`);
    }

    const label = String(options.label).trim();

    if (!label) {
        throw new Error('The metric label cannot be empty.');
    }

    const pascalName = toPascalCase(slug);
    const camelName = toCamelCase(slug);
    const ticker = options['live-ticker']?.trim() || 'TICKER';
    const companyName = options['live-company']?.trim() || 'TODO Company Name';
    const metricAbbreviation = options['metric-abbreviation']?.trim() || defaultAbbreviation(label);

    return {
        slug,
        label,
        pascalName,
        camelName,
        ticker,
        companyName,
        description: options.description?.trim() || DEFAULT_DESCRIPTION,
        value: options.value?.trim() || DEFAULT_VALUE,
        metricAbbreviation,
        upperBreadcrumb: toUpperBreadcrumb(slug),
    };
}
// 1.5. END ..........................................................................................

// 1.6. FILE RENDERING ...............................................................................
function renderBackendService(context) {
    return `// [ BACKEND > APPLICATION > SERVICES > ${context.upperBreadcrumb} ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * Placeholder analysis shape for ${context.label}. Replace the generic actuals
 * record with the metric's real formula inputs once they are known.
 */
export interface ${context.pascalName}Analysis {
  ticker: string;
  horizons: [];
  trailingTwelveMonthsActuals: Record<string, string>;
}
// 1.3. END ..........................................................................................

// 1.4. SERVICE ......................................................................................
/**
 * Scaffold for the ${context.label} analysis service.
 *
 * Replace this placeholder with the real formula, horizon analysis, and metric-
 * specific trailing-twelve-month actuals once the feature inputs are known.
 */
export async function analyse${context.pascalName}(
  ticker: string,
  _repository: FinancialDataRepository,
  _correlationId: string,
): Promise<${context.pascalName}Analysis> {
  return {
    ticker,
    horizons: [],
    trailingTwelveMonthsActuals: {},
  };
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderBackendServiceTest(context) {
    return `// [ BACKEND > APPLICATION > SERVICES > ${context.upperBreadcrumb} > TESTS ] #####################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyse${context.pascalName} } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
const repository = {
  async getAnnualFinancials() {
    return [];
  },
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("analyse${context.pascalName}", () => {
  it("returns the scaffold placeholder shape until the metric is implemented", async () => {
    const result = await analyse${context.pascalName}("AAPL", repository, "cid-${context.slug}");

    assert.deepEqual(result, {
      ticker: "AAPL",
      horizons: [],
      trailingTwelveMonthsActuals: {},
    });
  });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderBackendRepository(context) {
    return `// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP ${context.upperBreadcrumb} DATA ] #############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Scaffold for the FMP data adapter for ${context.label}.
 *
 * Replace the placeholder empty-result implementation with the real provider
 * endpoint mapping once the metric's required statement fields are known.
 */
export function createFmp${context.pascalName}DataRepository(): FinancialDataRepository {
  return {
    async getAnnualFinancials() {
      return [];
    },
  };
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderBackendRepositoryTest(context) {
    return `// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP ${context.upperBreadcrumb} DATA > TESTS ] #####################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmp${context.pascalName}DataRepository } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("createFmp${context.pascalName}DataRepository", () => {
  it("returns an empty scaffold result until the metric mapping is implemented", async () => {
    const repository = createFmp${context.pascalName}DataRepository();
    const result = await repository.getAnnualFinancials("AAPL", 12, "cid-${context.slug}");

    assert.deepEqual(result, []);
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderBackendController(context) {
    return `// [ BACKEND > PRESENTATION > CONTROLLERS > ${context.upperBreadcrumb} ] ########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
// 1.2. END ..........................................................................................

// 1.3. CONTROLLER ...................................................................................
/**
 * Placeholder controller for ${context.label}.
 *
 * This keeps the scaffold compile-safe while making it explicit that the
 * feature still needs its real repository, service, and response mapping.
 */
export const ${context.camelName}Controller: RequestHandler = async (request, _response, next) => {
  const ticker = String(request.query["ticker"] ?? "").trim().toUpperCase();

  if (!ticker) {
    return next(new HttpError(400, "Missing required query parameter: ticker"));
  }

  return next(new HttpError(501, "TODO: implement ${context.label} analysis endpoint"));
};
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderBackendControllerTest(context) {
    return `// [ BACKEND > PRESENTATION > CONTROLLERS > ${context.upperBreadcrumb} > TESTS ] ################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { ${context.camelName}Controller } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("${context.camelName}Controller", () => {
  it("rejects a request without a ticker", async () => {
    let capturedError = null;

    await ${context.camelName}Controller(
      { query: {} },
      {},
      (error) => {
        capturedError = error;
      },
    );

    assert.equal(capturedError?.statusCode, 400);
    assert.equal(capturedError?.message, "Missing required query parameter: ticker");
  });

  it("returns an explicit placeholder error until the endpoint is implemented", async () => {
    let capturedError = null;

    await ${context.camelName}Controller(
      { query: { ticker: "aapl" } },
      {},
      (error) => {
        capturedError = error;
      },
    );

    assert.equal(capturedError?.statusCode, 501);
    assert.equal(capturedError?.message, "TODO: implement ${context.label} analysis endpoint");
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderFrontendRoute(context) {
    return `// [ APP > API > ANALYSIS > ${context.upperBreadcrumb} ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. CONFIGURATION ................................................................................
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
// 1.3. END ..........................................................................................

// 1.4. ROUTE HANDLER ................................................................................
/**
 * Forwards a ${context.slug} analysis request to the backend service.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const ticker = request.nextUrl.searchParams.get('ticker')?.trim() ?? '';

    if (!ticker) {
        return NextResponse.json(
            { error: { message: 'Missing required query parameter: ticker' } },
            { status: 400 },
        );
    }

    const upstream = \`\${BACKEND_URL}/analysis/${context.slug}?ticker=\${encodeURIComponent(ticker)}\`;

    try {
        const response = await fetch(upstream, {
            cache: 'no-store',
            headers: { accept: 'application/json' },
        });

        const payload = await response.json();

        return NextResponse.json(payload, { status: response.status });
    } catch {
        return NextResponse.json(
            { error: { message: 'The analysis service is unavailable. Please try again shortly.' } },
            { status: 502 },
        );
    }
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderFrontendRouteTest(context) {
    return `// [ APP > API > ANALYSIS > ${context.upperBreadcrumb} > TESTS ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { GET } from './route';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const request = (url) => new NextRequest(url);
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('${context.slug} proxy route', () => {
    it('rejects a request without a ticker', async () => {
        const response = await GET(request('http://localhost/api/analysis/${context.slug}'));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { message: expect.any(String) } });
    });

    it('forwards the ticker to the backend and returns its response unchanged', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            status: 200,
            json: async () => ({ data: { ticker: 'AAPL', horizons: [] } }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET(request('http://localhost/api/analysis/${context.slug}?ticker=aapl'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0]?.[0]).toContain('ticker=aapl');
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ data: { ticker: 'AAPL' } });
    });

    it('returns a gateway error when the backend cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

        const response = await GET(request('http://localhost/api/analysis/${context.slug}?ticker=AAPL'));

        expect(response.status).toBe(502);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderFrontendSlice(context) {
    return `// [ REDUX > SLICES > ${context.upperBreadcrumb} ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type ${context.pascalName}Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export type ${context.pascalName}ErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface ${context.pascalName}BreakdownYear {
    period: string;
    value: string;
}

export interface ${context.pascalName}HorizonResult {
    label: string;
    range: string;
    value: string;
    breakdown: ${context.pascalName}BreakdownYear[];
    trend: 'up' | 'down';
}

export interface ${context.pascalName}ConsolidatedSummary {
    values: string[];
    denominator: string;
    result: string;
}

export type ${context.pascalName}TrailingTwelveMonthsActuals = Record<string, string>;

interface ${context.pascalName}Rejection {
    kind: ${context.pascalName}ErrorKind;
    message: string;
}

interface ${context.pascalName}State {
    status: ${context.pascalName}Status;
    ticker: string | null;
    horizons: ${context.pascalName}HorizonResult[];
    consolidatedSummary: ${context.pascalName}ConsolidatedSummary | null;
    trailingTwelveMonthsActuals: ${context.pascalName}TrailingTwelveMonthsActuals | null;
    errorKind: ${context.pascalName}ErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: ${context.pascalName}State = {
    status: 'idle',
    ticker: null,
    horizons: [],
    consolidatedSummary: null,
    trailingTwelveMonthsActuals: null,
    errorKind: null,
    errorMessage: null,
};
// 1.4. END ..........................................................................................

// 1.5. THUNK ........................................................................................
function errorKindForStatus(status: number): ${context.pascalName}ErrorKind {
    switch (status) {
        case 404:
            return 'not-found';
        case 429:
            return 'rate-limit';
        case 504:
            return 'timeout';
        default:
            return 'server';
    }
}

export const fetch${context.pascalName} = createAsyncThunk<
    {
        ticker: string;
        horizons: ${context.pascalName}HorizonResult[];
        consolidatedSummary: ${context.pascalName}ConsolidatedSummary;
        trailingTwelveMonthsActuals: ${context.pascalName}TrailingTwelveMonthsActuals;
    },
    string,
    { rejectValue: ${context.pascalName}Rejection }
>('${context.camelName}/fetch', async (ticker, { rejectWithValue }) => {
    let response;

    try {
        response = await fetch(\`/api/analysis/${context.slug}?ticker=\${encodeURIComponent(ticker)}\`, {
            headers: { accept: 'application/json' },
        });
    } catch {
        return rejectWithValue({
            kind: 'network',
            message: 'We could not reach the analysis service. Check your connection and try again.',
        });
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        return rejectWithValue({
            kind: errorKindForStatus(response.status),
            message: payload?.error?.message ?? 'The analysis could not be loaded.',
        });
    }

    return {
        ticker: payload?.data?.ticker ?? ticker,
        horizons: payload?.data?.horizons ?? [],
        consolidatedSummary: payload?.data?.consolidatedSummary ?? { values: [], result: '—', denominator: '0' },
        trailingTwelveMonthsActuals: payload?.data?.trailingTwelveMonthsActuals ?? {},
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const ${context.camelName}Slice = createSlice({
    name: '${context.camelName}',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetch${context.pascalName}.pending, (state) => {
                state.status = 'loading';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetch${context.pascalName}.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ticker = action.payload.ticker;
                state.horizons = action.payload.horizons;
                state.consolidatedSummary = action.payload.consolidatedSummary;
                state.trailingTwelveMonthsActuals = action.payload.trailingTwelveMonthsActuals;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetch${context.pascalName}.rejected, (state, action) => {
                state.status = 'failed';
                state.horizons = [];
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The analysis could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default ${context.camelName}Slice.reducer;

// END FILE ##########################################################################################
`;
}

function renderFrontendSliceTest(context) {
    return `// [ REDUX > SLICES > ${context.upperBreadcrumb} > TESTS ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import reducer, { fetch${context.pascalName} } from './${context.slug}.slice';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const makeStore = () => configureStore({ reducer: { ${context.camelName}: reducer } });

const jsonResponse = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
afterEach(() => {
    vi.restoreAllMocks();
});

describe('${context.camelName} slice', () => {
    it('stores the ticker and horizons on a successful analysis', async () => {
        const horizons = [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: 'TODO',
                breakdown: [{ period: '2024', value: 'TODO' }],
                trend: 'up',
            },
        ];
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { data: { ticker: 'AAPL', horizons } })));

        const store = makeStore();
        await store.dispatch(fetch${context.pascalName}('AAPL'));
        const state = store.getState().${context.camelName};

        expect(state.status).toBe('succeeded');
        expect(state.ticker).toBe('AAPL');
        expect(state.horizons).toHaveLength(1);
        expect(state.errorKind).toBeNull();
    });

    it('treats an empty horizon list as a successful but empty analysis', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { data: { ticker: 'ZZZZ', horizons: [] } })));

        const store = makeStore();
        await store.dispatch(fetch${context.pascalName}('ZZZZ'));
        const state = store.getState().${context.camelName};

        expect(state.status).toBe('succeeded');
        expect(state.horizons).toEqual([]);
    });

    it('classifies a rate limited upstream response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(jsonResponse(429, { error: { message: 'Too many requests' } })),
        );

        const store = makeStore();
        await store.dispatch(fetch${context.pascalName}('AAPL'));
        const state = store.getState().${context.camelName};

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('rate-limit');
        expect(state.errorMessage).toBe('Too many requests');
        expect(state.horizons).toEqual([]);
    });

    it('reports a network failure when the request cannot be made', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        const store = makeStore();
        await store.dispatch(fetch${context.pascalName}('AAPL'));
        const state = store.getState().${context.camelName};

        expect(state.status).toBe('failed');
        expect(state.errorKind).toBe('network');
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderFrontendSelectors(context) {
    return `// [ REDUX > SELECTORS > ${context.upperBreadcrumb} ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import type {
    ${context.pascalName}ConsolidatedSummary,
    ${context.pascalName}ErrorKind,
    ${context.pascalName}HorizonResult,
    ${context.pascalName}Status,
    ${context.pascalName}TrailingTwelveMonthsActuals,
} from '../slices/${context.slug}.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface ${context.pascalName}ErrorView {
    kind: ${context.pascalName}ErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const select${context.pascalName} = (state: RootState) => state.${context.camelName};

export const select${context.pascalName}Status = createSelector(
    select${context.pascalName},
    (slice): ${context.pascalName}Status => slice.status,
);

export const select${context.pascalName}Horizons = createSelector(
    select${context.pascalName},
    (slice): ${context.pascalName}HorizonResult[] => slice.horizons,
);

export const select${context.pascalName}IsEmpty = createSelector(
    select${context.pascalName},
    (slice): boolean => slice.status === 'succeeded' && slice.horizons.length === 0,
);

export const select${context.pascalName}Error = createSelector(
    select${context.pascalName},
    (slice): ${context.pascalName}ErrorView | null => {
        if (slice.status !== 'failed' || !slice.errorKind) {
            return null;
        }

        return {
            kind: slice.errorKind,
            message: slice.errorMessage ?? 'The analysis could not be loaded.',
        };
    },
);

export const select${context.pascalName}ConsolidatedSummary = createSelector(
    select${context.pascalName},
    (slice): ${context.pascalName}ConsolidatedSummary | null => slice.consolidatedSummary,
);

export const select${context.pascalName}TrailingTwelveMonthsActuals = createSelector(
    select${context.pascalName},
    (slice): ${context.pascalName}TrailingTwelveMonthsActuals | null => slice.trailingTwelveMonthsActuals,
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderFrontendSelectorsTest(context) {
    return `// [ REDUX > SELECTORS > ${context.upperBreadcrumb} > TESTS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    select${context.pascalName}Error,
    select${context.pascalName}Horizons,
    select${context.pascalName}IsEmpty,
    select${context.pascalName}Status,
} from './${context.slug}.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice) => ({ ${context.camelName}: slice });

const horizon = {
    label: 'Short Term',
    range: '1–3 Years',
    value: 'TODO',
    breakdown: [{ period: '2024', value: 'TODO' }],
    trend: 'up',
};

const consolidatedSummary = {
    values: ['TODO'],
    result: 'TODO',
    denominator: '1',
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('${context.camelName} selectors', () => {
    it('reports emptiness only after a successful load returns no horizons', () => {
        const loading = stateWith({ status: 'loading', ticker: null, horizons: [], consolidatedSummary: null, trailingTwelveMonthsActuals: null, errorKind: null, errorMessage: null });
        const empty = stateWith({ status: 'succeeded', ticker: 'ZZZZ', horizons: [], consolidatedSummary, trailingTwelveMonthsActuals: {}, errorKind: null, errorMessage: null });
        const loaded = stateWith({ status: 'succeeded', ticker: 'AAPL', horizons: [horizon], consolidatedSummary, trailingTwelveMonthsActuals: {}, errorKind: null, errorMessage: null });

        expect(select${context.pascalName}IsEmpty(loading)).toBe(false);
        expect(select${context.pascalName}IsEmpty(empty)).toBe(true);
        expect(select${context.pascalName}IsEmpty(loaded)).toBe(false);
    });

    it('exposes an error view only when the request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary: null,
            trailingTwelveMonthsActuals: null,
            errorKind: 'rate-limit',
            errorMessage: 'Too many requests',
        });
        const succeeded = stateWith({ status: 'succeeded', ticker: 'AAPL', horizons: [horizon], consolidatedSummary, trailingTwelveMonthsActuals: {}, errorKind: null, errorMessage: null });

        expect(select${context.pascalName}Error(failed)).toEqual({ kind: 'rate-limit', message: 'Too many requests' });
        expect(select${context.pascalName}Error(succeeded)).toBeNull();
    });

    it('passes through the current status and horizons', () => {
        const loaded = stateWith({ status: 'succeeded', ticker: 'AAPL', horizons: [horizon], consolidatedSummary, trailingTwelveMonthsActuals: {}, errorKind: null, errorMessage: null });

        expect(select${context.pascalName}Status(loaded)).toBe('succeeded');
        expect(select${context.pascalName}Horizons(loaded)).toEqual([horizon]);
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
`;
}

function renderRegistryEntry(context) {
    const liveLines = context.ticker !== 'TICKER'
        ? `        liveCompanyName: '${escapeSingleQuotes(context.companyName)}',
        liveTicker: '${escapeSingleQuotes(context.ticker)}',
`
        : '';

    return `    {
        slug: '${context.slug}',
        label: '${escapeSingleQuotes(context.label)}',
        value: '${escapeSingleQuotes(context.value)}',
        description: '${escapeSingleQuotes(context.description)}',
${liveLines}        formula: {
            title: 'How ${escapeSingleQuotes(context.metricAbbreviation)} Is Calculated',
            standardFormulaLabel: 'Standard Formula',
            actualsLabel: '${escapeSingleQuotes(context.ticker)} Trailing Twelve Months',
            numeratorLabel: 'TODO numerator label',
            denominatorLabel: 'TODO denominator label',
            numeratorValue: 'TODO',
            denominatorValue: 'TODO',
            factor: 'TODO',
            result: 'TODO',
            footnote: 'TODO: add the metric formula footnote.',
            metricAbbreviation: '${escapeSingleQuotes(context.metricAbbreviation)}',
        },
        horizons: [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: 'TODO',
                breakdown: [
                    { period: '2024', value: 'TODO' },
                    { period: '2023', value: 'TODO' },
                    { period: '2022', value: 'TODO' },
                ],
                insight: 'TODO: add the short-term horizon insight.',
                trend: 'up',
            },
            {
                label: 'Medium Term',
                range: '3–6 Years',
                value: 'TODO',
                breakdown: [
                    { period: '2021', value: 'TODO' },
                    { period: '2020', value: 'TODO' },
                    { period: '2019', value: 'TODO' },
                ],
                insight: 'TODO: add the medium-term horizon insight.',
                trend: 'up',
            },
            {
                label: 'Long Term',
                range: '6–9 Years',
                value: 'TODO',
                breakdown: [
                    { period: '2018', value: 'TODO' },
                    { period: '2017', value: 'TODO' },
                    { period: '2016', value: 'TODO' },
                ],
                insight: 'TODO: add the long-term horizon insight.',
                trend: 'up',
            },
            {
                label: 'Very Long Term',
                range: '9–12 Years',
                value: 'TODO',
                breakdown: [
                    { period: '2015', value: 'TODO' },
                    { period: '2014', value: 'TODO' },
                    { period: '2013', value: 'TODO' },
                ],
                insight: 'TODO: add the very-long-term horizon insight.',
                trend: 'up',
            },
        ],
        consolidation: {
            title: 'Consolidation Summary',
            values: ['TODO', 'TODO', 'TODO', 'TODO'],
            denominator: '4',
            result: 'TODO',
            note: 'TODO: add the consolidation summary note.',
            mobileNote: 'TODO: add the mobile consolidation note.',
        },
        education: {
            definitionTitle: 'What Is ${escapeSingleQuotes(context.label)}?',
            definition: 'TODO: define the metric.',
            importanceTitle: 'Why ${escapeSingleQuotes(context.metricAbbreviation)} Matters in Value Investing',
            importance: [
                'TODO: add the first reason the metric matters.',
                'TODO: add the second reason the metric matters.',
            ],
            quote: 'TODO: add the supporting investing quote.',
            quoteAuthor: 'TODO author',
            quoteAuthorTitle: 'TODO title',
            mobileImportance: 'TODO: add the mobile importance summary.',
            mobileQuote: 'TODO: add the mobile quote summary.',
        },
    },`;
}

function escapeSingleQuotes(value) {
    return String(value).replaceAll("'", "\\'");
}

export function renderFiles(context) {
    return [
        {
            path: `backend/src/application/services/${context.slug}/index.ts`,
            content: renderBackendService(context),
        },
        {
            path: `backend/src/application/services/${context.slug}/index.test.ts`,
            content: renderBackendServiceTest(context),
        },
        {
            path: `backend/src/infrastructure/repositories/fmp-${context.slug}-data/index.ts`,
            content: renderBackendRepository(context),
        },
        {
            path: `backend/src/infrastructure/repositories/fmp-${context.slug}-data/index.test.ts`,
            content: renderBackendRepositoryTest(context),
        },
        {
            path: `backend/src/presentation/controllers/${context.slug}/index.ts`,
            content: renderBackendController(context),
        },
        {
            path: `backend/src/presentation/controllers/${context.slug}/index.test.ts`,
            content: renderBackendControllerTest(context),
        },
        {
            path: `frontend/app/api/analysis/${context.slug}/route.ts`,
            content: renderFrontendRoute(context),
        },
        {
            path: `frontend/app/api/analysis/${context.slug}/route.test.ts`,
            content: renderFrontendRouteTest(context),
        },
        {
            path: `frontend/redux/slices/${context.slug}.slice.ts`,
            content: renderFrontendSlice(context),
        },
        {
            path: `frontend/redux/slices/${context.slug}.slice.test.ts`,
            content: renderFrontendSliceTest(context),
        },
        {
            path: `frontend/redux/selectors/${context.slug}.selectors.ts`,
            content: renderFrontendSelectors(context),
        },
        {
            path: `frontend/redux/selectors/${context.slug}.selectors.test.ts`,
            content: renderFrontendSelectorsTest(context),
        },
    ];
}
// 1.6. END ..........................................................................................

// 1.7. REMOTE AGENT BRIEF ...........................................................................
export function buildRemoteAgentBrief(context) {
    return [
        `Remote agent kickoff for "${context.label}" (${context.slug})`,
        '',
        'Load skills first:',
        '- ai-operating-principles',
        '- feature-blueprint',
        '- remote-metric-delivery',
        '- documentation-maintenance',
        '- testing-public-interface',
        '- mutation-resistance',
        '- backwards-compatibility',
        '- ddd, correlation-ids, explanatory-comments, object-key-ordering when the backend is touched',
        '- component-craft, surface-integrity, component-states, ui-verification when the frontend is touched',
        '',
        'Read these reference files before editing:',
        '- backend/src/application/services/return-on-equity/index.ts',
        '- backend/src/application/services/free-cash-flow/index.ts',
        '- backend/src/infrastructure/repositories/fmp-financial-data/index.ts',
        '- backend/src/infrastructure/repositories/fmp-cash-flow-data/index.ts',
        '- backend/src/presentation/controllers/return-on-equity/index.ts',
        '- backend/src/presentation/controllers/free-cash-flow/index.ts',
        '- backend/src/app.ts',
        '- backend/src/middleware/correlation-id.ts',
        '- frontend/app/api/analysis/return-on-equity/route.ts',
        '- frontend/app/api/analysis/free-cash-flow/route.ts',
        '- frontend/redux/slices/return-on-equity.slice.ts',
        '- frontend/redux/slices/free-cash-flow.slice.ts',
        '- frontend/redux/selectors/return-on-equity.selectors.ts',
        '- frontend/redux/selectors/free-cash-flow.selectors.ts',
        '- frontend/app/details/[metric]/page.tsx',
        '- frontend/data/financial-metrics.ts',
        '- frontend/redux/store.ts',
        '',
        'Preserve these repository rules:',
        '- keep the backend split into domain, infrastructure, application, and presentation;',
        '- wire the feature only through backend/src/app.ts, frontend/data/financial-metrics.ts, and frontend/app/details/[metric]/page.tsx;',
        '- reuse the existing detail-page components, Redux Toolkit slices, Reselect selectors, theme tokens, and loading/empty/error patterns;',
        '- include correlationId in backend logs and responses, and preserve x-correlation-id request forwarding;',
        '- replace scaffold TODOs with real metric logic and copy before claiming completion.',
        '',
        'Validate before handoff:',
        '- backend targeted tests for the metric files;',
        '- pnpm coverage:gate for backend changes;',
        '- a scoped mutation run for touched backend logic;',
        '- frontend route/slice/selector tests;',
        '- browser verification of /details/' + context.slug + ' for loading, empty, and error states when UI behavior changed.',
    ].join('\n');
}
// 1.7. END ..........................................................................................

// 1.8. REGISTRY .....................................................................................
export function addRegistryEntry(source, context) {
    if (source.includes(`slug: '${context.slug}'`)) {
        throw new Error(`The metric slug "${context.slug}" already exists in frontend/data/financial-metrics.ts.`);
    }

    const marker = '\n];\n\nexport const getFinancialMetric';

    if (!source.includes(marker)) {
        throw new Error('Could not find the financialMetrics array terminator in frontend/data/financial-metrics.ts.');
    }

    return source.replace(marker, `\n${renderRegistryEntry(context)}\n];\n\nexport const getFinancialMetric`);
}
// 1.8. END ..........................................................................................

// 1.9. SCAFFOLDING ..................................................................................
export async function scaffoldMetric(repoRoot, rawOptions) {
    const context = buildMetricContext(rawOptions);
    const targets = renderFiles(context);
    const registryPath = path.join(repoRoot, 'frontend/data/financial-metrics.ts');

    for (const target of targets) {
        const absolutePath = path.join(repoRoot, target.path);

        try {
            await readFile(absolutePath, 'utf8');
            throw new Error(`Refusing to overwrite existing file: ${target.path}`);
        } catch (error) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    let nextRegistrySource = null;

    if (!rawOptions.noRegistry) {
        const registrySource = await readFile(registryPath, 'utf8');
        nextRegistrySource = addRegistryEntry(registrySource, context);
    }

    if (rawOptions.dryRun) {
        return {
            agentBrief: buildRemoteAgentBrief(context),
            context,
            created: targets.map((target) => target.path),
            updated: rawOptions.noRegistry ? [] : ['frontend/data/financial-metrics.ts'],
        };
    }

    for (const target of targets) {
        const absolutePath = path.join(repoRoot, target.path);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, target.content, 'utf8');
    }

    if (nextRegistrySource !== null) {
        await writeFile(registryPath, nextRegistrySource, 'utf8');
    }

    return {
        agentBrief: buildRemoteAgentBrief(context),
        context,
        created: targets.map((target) => target.path),
        updated: rawOptions.noRegistry ? [] : ['frontend/data/financial-metrics.ts'],
    };
}
// 1.9. END ..........................................................................................

// END FILE ##########################################################################################
