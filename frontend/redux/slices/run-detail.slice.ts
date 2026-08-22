// [ REDUX > SLICES > RUN DETAIL ] ###################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { buildVersionedFrontendApiPath } from '../../lib/api-version';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type RunDetailStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type RunDetailErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface RunDetailMetrics {
    debtToEquity: number;
    freeCashFlow: number;
    marginOfSafety: number;
    profitMargin: number;
    returnOnEquity: number;
}

export interface RunDetailStrengths {
    debtToEquity: 'strong' | 'medium' | 'weak';
    freeCashFlow: 'strong' | 'medium' | 'weak';
    marginOfSafety: 'strong' | 'medium' | 'weak';
    profitMargin: 'strong' | 'medium' | 'weak';
    returnOnEquity: 'strong' | 'medium' | 'weak';
}

export interface RunDetailTradeExecution {
    attempted: boolean;
    mode: string;
    maxTradeAmount: number;
    sharePrice: number;
    quantity: number;
    orderClientId: string | null;
    status: string;
    skipReason: string | null;
}

/**
 * Full decision data including metrics, strengths, and trade execution
 * details shown on the decision detail page.
 */
export interface RunDetailData {
    ticker: string;
    companyName: string | null;
    batchId: string;
    sourceFile: string;
    processedAt: string;
    status: string;
    analysisModel: string;
    constitutionVersion: string;
    metrics: RunDetailMetrics;
    strengths: RunDetailStrengths;
    tradeExecution: RunDetailTradeExecution;
}

interface RunDetailRejection {
    kind: RunDetailErrorKind;
    message: string;
}

interface RunDetailState {
    status: RunDetailStatus;
    data: RunDetailData | null;
    errorKind: RunDetailErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: RunDetailState = {
    status: 'idle',
    data: null,
    errorKind: null,
    errorMessage: null,
};
// 1.4. END ..........................................................................................

// 1.5. THUNK ........................................................................................
function errorKindForStatus(status: number): RunDetailErrorKind {
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

export const fetchRunDetail = createAsyncThunk<
    RunDetailData,
    { batchId: string; ticker: string },
    { rejectValue: RunDetailRejection }
>('runDetail/fetch', async (params, { rejectWithValue }) => {
    const { batchId, ticker } = params;
    const encodedBatchId = encodeURIComponent(batchId);
    const encodedTicker = encodeURIComponent(ticker);

    let response: Response;

    try {
        response = await fetch(
            `${buildVersionedFrontendApiPath('/runs')}/${encodedBatchId}/${encodedTicker}`,
            { headers: { accept: 'application/json' } },
        );
    } catch {
        return rejectWithValue({
            kind: 'network',
            message: 'We could not reach the runs service. Check your connection and try again.',
        });
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        return rejectWithValue({
            kind: errorKindForStatus(response.status),
            message: payload?.error?.message ?? 'The decision could not be loaded.',
        });
    }

    return payload?.data;
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const runDetailSlice = createSlice({
    name: 'runDetail',
    initialState,
    reducers: {
        /**
         * Resets the detail state so navigating away and back produces a fresh
         * load cycle.
         */
        resetRunDetail: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRunDetail.pending, (state) => {
                state.status = 'loading';
                state.data = null;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchRunDetail.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchRunDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.data = null;
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The decision could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export const { resetRunDetail } = runDetailSlice.actions;
export default runDetailSlice.reducer;

// END FILE ##########################################################################################
