// [ REDUX > SLICES > PORTFOLIO ] ####################################################################

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
export type PortfolioStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type PortfolioMode = 'paper' | 'live';
export type PortfolioErrorKind = 'rate-limit' | 'timeout' | 'server' | 'network';

export interface PortfolioHolding {
    company: string;
    ticker: string;
    shares: string;
    averageBuy: string;
    current: string;
    value: string;
    gainLoss: string;
    score: string;
}

export interface PortfolioSummary {
    totalValue: string;
    totalInvested: string;
    totalGainLoss: string;
    totalGainPercentage: string | null;
    averageScore: string | null;
}

interface PortfolioRejection {
    kind: PortfolioErrorKind;
    message: string;
}

interface PortfolioState {
    status: PortfolioStatus;
    mode: PortfolioMode;
    holdings: PortfolioHolding[];
    summary: PortfolioSummary | null;
    errorKind: PortfolioErrorKind | null;
    errorMessage: string | null;
}

interface PortfolioApiResponse {
    data?: {
        mode?: PortfolioMode;
        positions?: Array<{
            companyName?: string | null;
            ticker?: string;
            quantity?: number;
            averageEntryPrice?: string | null;
            currentPrice?: string | null;
            marketValue?: string | null;
            unrealizedGainLoss?: string | null;
            scoreAtPurchase?: string | null;
        }>;
        summary?: {
            totalValue?: string;
            totalInvested?: string;
            totalGainLoss?: string;
            totalGainPercentage?: string | null;
            averageScoreAtPurchase?: string | null;
        };
    };
    error?: { message?: string };
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: PortfolioState = {
    status: 'idle',
    mode: 'paper',
    holdings: [],
    summary: null,
    errorKind: null,
    errorMessage: null,
};
// 1.4. END ..........................................................................................

// 1.5. HELPERS ......................................................................................
function errorKindForStatus(status: number): PortfolioErrorKind {
    switch (status) {
        case 429:
            return 'rate-limit';
        case 504:
            return 'timeout';
        default:
            return 'server';
    }
}

function formatGainLoss(value: string | null | undefined): string {
    if (!value || value === '$0.00') {
        return '$0.00';
    }

    if (value.startsWith('−') || value.startsWith('-')) {
        return `−$${value.replace(/^[−-]\$?/, '')}`;
    }

    if (value.startsWith('+$')) {
        return value;
    }

    if (value.startsWith('$-')) {
        return `−$${value.slice(2)}`;
    }

    return value.startsWith('-')
        ? `−${value.slice(1)}`
        : value.startsWith('+')
            ? value
            : `+${value}`;
}

function formatScore(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return value;
}

function mapHoldings(payload: PortfolioApiResponse['data']): PortfolioHolding[] {
    return (payload?.positions ?? []).map((position) => ({
        company: position.companyName ?? '—',
        ticker: position.ticker ?? '—',
        shares: String(position.quantity ?? 0),
        averageBuy: position.averageEntryPrice ?? '—',
        current: position.currentPrice ?? '—',
        value: position.marketValue ?? '—',
        gainLoss: formatGainLoss(position.unrealizedGainLoss),
        score: formatScore(position.scoreAtPurchase),
    }));
}

function mapSummary(payload: PortfolioApiResponse['data']): PortfolioSummary {
    return {
        totalValue: payload?.summary?.totalValue ?? '$0.00',
        totalInvested: payload?.summary?.totalInvested ?? '$0.00',
        totalGainLoss: formatGainLoss(payload?.summary?.totalGainLoss ?? '$0.00'),
        totalGainPercentage: payload?.summary?.totalGainPercentage ?? null,
        averageScore: payload?.summary?.averageScoreAtPurchase ?? null,
    };
}
// 1.5. END ..........................................................................................

// 1.6. THUNK ........................................................................................
export const fetchPortfolio = createAsyncThunk<
    {
        mode: PortfolioMode;
        holdings: PortfolioHolding[];
        summary: PortfolioSummary;
    },
    PortfolioMode | undefined,
    { rejectValue: PortfolioRejection }
>('portfolio/fetch', async (mode = 'paper', { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch(`/api/portfolio?mode=${encodeURIComponent(mode)}`, {
            headers: {
                accept: 'application/json',
                [CORRELATION_ID_HEADER]: createCorrelationId(),
            },
        });
    } catch {
        return rejectWithValue({
            kind: 'network',
            message: 'We could not reach the portfolio service. Check your connection and try again.',
        });
    }

    const payload = await response.json().catch(() => null) as PortfolioApiResponse | null;

    if (!response.ok) {
        return rejectWithValue({
            kind: errorKindForStatus(response.status),
            message: payload?.error?.message ?? 'The portfolio could not be loaded.',
        });
    }

    return {
        mode: payload?.data?.mode ?? mode,
        holdings: mapHoldings(payload?.data),
        summary: mapSummary(payload?.data),
    };
});
// 1.6. END ..........................................................................................

// 1.7. SLICE ........................................................................................
const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPortfolio.pending, (state, action) => {
                state.status = 'loading';
                state.mode = action.meta.arg ?? 'paper';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchPortfolio.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.mode = action.payload.mode;
                state.holdings = action.payload.holdings;
                state.summary = action.payload.summary;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchPortfolio.rejected, (state, action) => {
                state.status = 'failed';
                state.holdings = [];
                state.summary = null;
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The portfolio could not be loaded.';
            });
    },
});
// 1.7. END ..........................................................................................

export default portfolioSlice.reducer;

// END FILE ##########################################################################################
