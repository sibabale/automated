// [ REDUX > SLICES > PROFIT MARGIN ] ################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    CORRELATION_ID_HEADER,
    createCorrelationId,
} from '../../lib/correlation-id';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type ProfitMarginStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type ProfitMarginErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface ProfitMarginBreakdownYear {
    period: string;
    value: string;
}

export interface ProfitMarginHorizonResult {
    label: string;
    range: string;
    value: string;
    breakdown: ProfitMarginBreakdownYear[];
    trend: 'up' | 'down';
}

export interface ProfitMarginConsolidatedSummary {
    values: string[];
    denominator: string;
    result: string;
}

export interface ProfitMarginTrailingTwelveMonthsActuals {
    netIncome: string;
    revenue: string;
}

interface ProfitMarginRejection {
    kind: ProfitMarginErrorKind;
    message: string;
}

interface ProfitMarginState {
    status: ProfitMarginStatus;
    ticker: string | null;
    horizons: ProfitMarginHorizonResult[];
    consolidatedSummary: ProfitMarginConsolidatedSummary | null;
    trailingTwelveMonthsActuals: ProfitMarginTrailingTwelveMonthsActuals | null;
    errorKind: ProfitMarginErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: ProfitMarginState = {
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
/**
 * Maps an upstream HTTP status to the kind of failure the user interface shows.
 */
function errorKindForStatus(status: number): ProfitMarginErrorKind {
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
 * Fetches a company's profit-margin analysis through the same-origin proxy.
 *
 * The proxy keeps the backend origin private, so this thunk only ever talks to
 * the local `/api` route. A fresh correlation id is sent with each logical load
 * so the browser request and the backend work can be traced together.
 */
export const fetchProfitMargin = createAsyncThunk<
    {
        ticker: string;
        horizons: ProfitMarginHorizonResult[];
        consolidatedSummary: ProfitMarginConsolidatedSummary;
        trailingTwelveMonthsActuals: ProfitMarginTrailingTwelveMonthsActuals;
    },
    string,
    { rejectValue: ProfitMarginRejection }
>('profitMargin/fetch', async (ticker, { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch(`/api/analysis/profit-margin?ticker=${encodeURIComponent(ticker)}`, {
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
            netIncome: '—',
            revenue: '—',
        },
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const profitMarginSlice = createSlice({
    name: 'profitMargin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfitMargin.pending, (state) => {
                state.status = 'loading';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchProfitMargin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ticker = action.payload.ticker;
                state.horizons = action.payload.horizons;
                state.consolidatedSummary = action.payload.consolidatedSummary;
                state.trailingTwelveMonthsActuals = action.payload.trailingTwelveMonthsActuals;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchProfitMargin.rejected, (state, action) => {
                state.status = 'failed';
                state.horizons = [];
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The analysis could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default profitMarginSlice.reducer;

// END FILE ##########################################################################################
