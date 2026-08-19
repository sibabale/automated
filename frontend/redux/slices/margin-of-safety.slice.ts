// [ REDUX > SLICES > MARGIN OF SAFETY ] #############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    CORRELATION_ID_HEADER,
    createCorrelationId,
} from '../../lib/correlation-id';
import { buildVersionedFrontendApiPath } from '../../lib/api-version';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type MarginOfSafetyStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type MarginOfSafetyErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface MarginOfSafetyBreakdownYear {
    period: string;
    value: string;
}

export interface MarginOfSafetyHorizonResult {
    label: string;
    range: string;
    value: string;
    breakdown: MarginOfSafetyBreakdownYear[];
    trend: 'up' | 'down';
}

export interface MarginOfSafetyConsolidatedSummary {
    values: string[];
    denominator: string;
    result: string;
}

export interface MarginOfSafetyTrailingTwelveMonthsActuals {
    intrinsicValue: string;
    stockPrice: string;
}

interface MarginOfSafetyRejection {
    kind: MarginOfSafetyErrorKind;
    message: string;
}

interface MarginOfSafetyState {
    status: MarginOfSafetyStatus;
    ticker: string | null;
    horizons: MarginOfSafetyHorizonResult[];
    consolidatedSummary: MarginOfSafetyConsolidatedSummary | null;
    trailingTwelveMonthsActuals: MarginOfSafetyTrailingTwelveMonthsActuals | null;
    errorKind: MarginOfSafetyErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: MarginOfSafetyState = {
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
function errorKindForStatus(status: number): MarginOfSafetyErrorKind {
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

/**
 * Fetches a company's margin-of-safety analysis through the same-origin proxy.
 *
 * The proxy keeps the backend origin private, so this thunk only ever talks to
 * the local `/api` route. A fresh correlation id is sent with each logical load
 * so the browser request and the backend work can be traced together.
 */
export const fetchMarginOfSafety = createAsyncThunk<
    {
        ticker: string;
        horizons: MarginOfSafetyHorizonResult[];
        consolidatedSummary: MarginOfSafetyConsolidatedSummary;
        trailingTwelveMonthsActuals: MarginOfSafetyTrailingTwelveMonthsActuals;
    },
    string,
    { rejectValue: MarginOfSafetyRejection }
>('marginOfSafety/fetch', async (ticker, { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch(`${buildVersionedFrontendApiPath('/analysis/margin-of-safety')}?ticker=${encodeURIComponent(ticker)}`, {
            headers: {
                accept: 'application/json',
                [CORRELATION_ID_HEADER]: createCorrelationId(),
            },
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
        trailingTwelveMonthsActuals: payload?.data?.trailingTwelveMonthsActuals ?? {
            intrinsicValue: '—',
            stockPrice: '—',
        },
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const marginOfSafetySlice = createSlice({
    name: 'marginOfSafety',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMarginOfSafety.pending, (state) => {
                state.status = 'loading';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchMarginOfSafety.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ticker = action.payload.ticker;
                state.horizons = action.payload.horizons;
                state.consolidatedSummary = action.payload.consolidatedSummary;
                state.trailingTwelveMonthsActuals = action.payload.trailingTwelveMonthsActuals;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchMarginOfSafety.rejected, (state, action) => {
                state.status = 'failed';
                state.horizons = [];
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The analysis could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default marginOfSafetySlice.reducer;

// END FILE ##########################################################################################
