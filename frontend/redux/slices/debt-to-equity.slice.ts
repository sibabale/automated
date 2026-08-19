// [ REDUX > SLICES > DEBT TO EQUITY ] ###############################################################

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
export type DebtToEquityStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type DebtToEquityErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface DebtToEquityBreakdownYear {
    period: string;
    value: string;
}

export interface DebtToEquityHorizonResult {
    label: string;
    range: string;
    value: string;
    breakdown: DebtToEquityBreakdownYear[];
    trend: 'up' | 'down';
}

export interface DebtToEquityConsolidatedSummary {
    values: string[];
    denominator: string;
    result: string;
}

export interface DebtToEquityTrailingTwelveMonthsActuals {
    totalDebt: string;
    shareholdersEquity: string;
}

interface DebtToEquityRejection {
    kind: DebtToEquityErrorKind;
    message: string;
}

interface DebtToEquityState {
    status: DebtToEquityStatus;
    ticker: string | null;
    horizons: DebtToEquityHorizonResult[];
    consolidatedSummary: DebtToEquityConsolidatedSummary | null;
    trailingTwelveMonthsActuals: DebtToEquityTrailingTwelveMonthsActuals | null;
    errorKind: DebtToEquityErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: DebtToEquityState = {
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
function errorKindForStatus(status: number): DebtToEquityErrorKind {
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
 * Fetches a company's debt-to-equity analysis through the same-origin proxy.
 *
 * The proxy keeps the backend origin private, so this thunk only ever talks to
 * the local `/api` route. A fresh correlation id is sent with each logical load
 * so the browser request and the backend work can be traced together.
 */
export const fetchDebtToEquity = createAsyncThunk<
    {
        ticker: string;
        horizons: DebtToEquityHorizonResult[];
        consolidatedSummary: DebtToEquityConsolidatedSummary;
        trailingTwelveMonthsActuals: DebtToEquityTrailingTwelveMonthsActuals;
    },
    string,
    { rejectValue: DebtToEquityRejection }
>('debtToEquity/fetch', async (ticker, { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch(`${buildVersionedFrontendApiPath('/analysis/debt-to-equity')}?ticker=${encodeURIComponent(ticker)}`, {
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
            totalDebt: '—',
            shareholdersEquity: '—',
        },
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const debtToEquitySlice = createSlice({
    name: 'debtToEquity',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDebtToEquity.pending, (state) => {
                state.status = 'loading';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchDebtToEquity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ticker = action.payload.ticker;
                state.horizons = action.payload.horizons;
                state.consolidatedSummary = action.payload.consolidatedSummary;
                state.trailingTwelveMonthsActuals = action.payload.trailingTwelveMonthsActuals;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchDebtToEquity.rejected, (state, action) => {
                state.status = 'failed';
                state.horizons = [];
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The analysis could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default debtToEquitySlice.reducer;

// END FILE ##########################################################################################
