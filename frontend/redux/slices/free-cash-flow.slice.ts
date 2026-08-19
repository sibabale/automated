// [ REDUX > SLICES > FREE CASH FLOW ] ###############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { buildVersionedFrontendApiPath } from '../../lib/api-version';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type FreeCashFlowStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type FreeCashFlowErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface FreeCashFlowBreakdownYear {
    period: string;
    value: string;
}

export interface FreeCashFlowHorizonResult {
    label: string;
    range: string;
    value: string;
    breakdown: FreeCashFlowBreakdownYear[];
    trend: 'up' | 'down';
}

export interface FreeCashFlowConsolidatedSummary {
    values: string[];
    denominator: string;
    result: string;
}

export interface FreeCashFlowTrailingTwelveMonthsActuals {
    operatingCashFlow: string;
    capitalExpenditure: string;
}

interface FreeCashFlowRejection {
    kind: FreeCashFlowErrorKind;
    message: string;
}

interface FreeCashFlowState {
    status: FreeCashFlowStatus;
    ticker: string | null;
    horizons: FreeCashFlowHorizonResult[];
    consolidatedSummary: FreeCashFlowConsolidatedSummary | null;
    trailingTwelveMonthsActuals: FreeCashFlowTrailingTwelveMonthsActuals | null;
    errorKind: FreeCashFlowErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: FreeCashFlowState = {
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
function errorKindForStatus(status: number): FreeCashFlowErrorKind {
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
 * Fetches a company's free-cash-flow analysis through the same-origin proxy.
 *
 * The proxy keeps the backend origin private, so this thunk only ever talks to
 * the local `/api` route. Failures are normalised into a `kind`/`message` pair
 * the selectors can turn into a friendly error state.
 */
export const fetchFreeCashFlow = createAsyncThunk<
    {
        ticker: string;
        horizons: FreeCashFlowHorizonResult[];
        consolidatedSummary: FreeCashFlowConsolidatedSummary;
        trailingTwelveMonthsActuals: FreeCashFlowTrailingTwelveMonthsActuals;
    },
    string,
    { rejectValue: FreeCashFlowRejection }
>('freeCashFlow/fetch', async (ticker, { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch(`${buildVersionedFrontendApiPath('/analysis/free-cash-flow')}?ticker=${encodeURIComponent(ticker)}`, {
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
        trailingTwelveMonthsActuals: payload?.data?.trailingTwelveMonthsActuals ?? {
            operatingCashFlow: '—',
            capitalExpenditure: '—',
        },
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const freeCashFlowSlice = createSlice({
    name: 'freeCashFlow',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFreeCashFlow.pending, (state) => {
                state.status = 'loading';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchFreeCashFlow.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ticker = action.payload.ticker;
                state.horizons = action.payload.horizons;
                state.consolidatedSummary = action.payload.consolidatedSummary;
                state.trailingTwelveMonthsActuals = action.payload.trailingTwelveMonthsActuals;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchFreeCashFlow.rejected, (state, action) => {
                state.status = 'failed';
                state.horizons = [];
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The analysis could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default freeCashFlowSlice.reducer;

// END FILE ##########################################################################################
