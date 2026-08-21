// [ REDUX > SLICES > OVERVIEW ] #####################################################################

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
export type OverviewStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type OverviewErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface OverviewMetricValue {
    slug: 'return-on-equity' | 'free-cash-flow' | 'debt-to-equity' | 'profit-margin' | 'margin-of-safety';
    value: string;
    strength: 'strong' | 'medium' | 'weak';
    description: string;
}

export interface OverviewQualitativePillar {
    description: string;
    label: string;
    title: string;
}

export interface OverviewQualitativeAnalysis {
    pillars: OverviewQualitativePillar[];
    summary: string;
}

export interface OverviewReportHeader {
    companyName: string;
    industry: string;
    sector: string;
    sharePrice: string;
    ticker: string;
}

interface OverviewRejection {
    kind: OverviewErrorKind;
    message: string;
}

interface OverviewState {
    status: OverviewStatus;
    ticker: string | null;
    metrics: OverviewMetricValue[];
    qualitativeAnalysis: OverviewQualitativeAnalysis | null;
    reportHeader: OverviewReportHeader | null;
    errorKind: OverviewErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: OverviewState = {
    status: 'idle',
    ticker: null,
    metrics: [],
    qualitativeAnalysis: null,
    reportHeader: null,
    errorKind: null,
    errorMessage: null,
};
// 1.4. END ..........................................................................................

// 1.5. THUNK ........................................................................................
function errorKindForStatus(status: number): OverviewErrorKind {
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
 * Fetches the overview header and metric-card values for one ticker.
 *
 * A fresh correlation id is sent for each search so the browser action and the
 * backend overview request can be traced together.
 */
export const fetchOverview = createAsyncThunk<
    {
        ticker: string;
        metrics: OverviewMetricValue[];
        qualitativeAnalysis: OverviewQualitativeAnalysis | null;
        reportHeader: OverviewReportHeader;
    },
    string,
    { rejectValue: OverviewRejection }
>('overview/fetch', async (ticker, { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch(`${buildVersionedFrontendApiPath('/overview')}?ticker=${encodeURIComponent(ticker)}`, {
            headers: {
                accept: 'application/json',
                [CORRELATION_ID_HEADER]: createCorrelationId(),
            },
        });
    } catch {
        return rejectWithValue({
            kind: 'network',
            message: 'We could not reach the overview service. Check your connection and try again.',
        });
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        return rejectWithValue({
            kind: errorKindForStatus(response.status),
            message: payload?.error?.message ?? 'The overview could not be loaded.',
        });
    }

    return {
        ticker: payload?.data?.reportHeader?.ticker ?? ticker,
        metrics: payload?.data?.metrics ?? [],
        qualitativeAnalysis: payload?.data?.qualitativeAnalysis ?? null,
        reportHeader: payload?.data?.reportHeader ?? {
            companyName: '—',
            industry: '—',
            sector: '—',
            sharePrice: '—',
            ticker,
        },
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const overviewSlice = createSlice({
    name: 'overview',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverview.pending, (state, action) => {
                state.status = 'loading';
                state.ticker = action.meta.arg;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchOverview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ticker = action.payload.ticker;
                state.metrics = action.payload.metrics;
                state.qualitativeAnalysis = action.payload.qualitativeAnalysis;
                state.reportHeader = action.payload.reportHeader;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchOverview.rejected, (state, action) => {
                state.status = 'failed';
                state.metrics = [];
                state.qualitativeAnalysis = null;
                state.reportHeader = null;
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The overview could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default overviewSlice.reducer;

// END FILE ##########################################################################################
