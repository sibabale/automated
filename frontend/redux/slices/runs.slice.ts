// [ REDUX > SLICES > RUNS ] #########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { buildVersionedFrontendApiPath } from '../../lib/api-version';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type RunsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type RunsErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface RunsItem {
    apiVersion: string;
    ticker: string;
    companyName: string | null;
    batchId: string;
    sourceFile: string;
    processedAt: string;
    status: string;
    scoreAtPurchase: number;
    analysisModel: string;
    constitutionVersion: string;
}

export interface RunsResponseData {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: RunsItem[];
}

interface RunsRejection {
    kind: RunsErrorKind;
    message: string;
}

interface RunsState {
    status: RunsStatus;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: RunsItem[];
    errorKind: RunsErrorKind | null;
    errorMessage: string | null;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: RunsState = {
    status: 'idle',
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    items: [],
    errorKind: null,
    errorMessage: null,
};
// 1.4. END ..........................................................................................

// 1.5. THUNK ........................................................................................
function errorKindForStatus(status: number): RunsErrorKind {
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

export const fetchRuns = createAsyncThunk<
    RunsResponseData,
    { page?: number; pageSize?: number; status?: string } | undefined,
    { rejectValue: RunsRejection }
>('runs/fetch', async (params, { rejectWithValue }) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const status = params?.status;

    const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    if (status) {
        queryParams.set('status', status);
    }

    let response: Response;

    try {
        response = await fetch(`${buildVersionedFrontendApiPath('/runs')}?${queryParams.toString()}`, {
            headers: { accept: 'application/json' },
        });
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
            message: payload?.error?.message ?? 'The runs could not be loaded.',
        });
    }

    return {
        page: payload?.data?.page ?? page,
        pageSize: payload?.data?.pageSize ?? pageSize,
        totalItems: payload?.data?.totalItems ?? 0,
        totalPages: payload?.data?.totalPages ?? 1,
        items: payload?.data?.items ?? [],
    };
});
// 1.5. END ..........................................................................................

// 1.6. SLICE ........................................................................................
const runsSlice = createSlice({
    name: 'runs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRuns.pending, (state) => {
                state.status = 'loading';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchRuns.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.page = action.payload.page;
                state.pageSize = action.payload.pageSize;
                state.totalItems = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
                state.items = action.payload.items;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(fetchRuns.rejected, (state, action) => {
                state.status = 'failed';
                state.items = [];
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The runs could not be loaded.';
            });
    },
});
// 1.6. END ..........................................................................................

export default runsSlice.reducer;

// END FILE ##########################################################################################
