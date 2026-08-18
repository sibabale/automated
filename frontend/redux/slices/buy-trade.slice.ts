// [ REDUX > SLICES > BUY TRADE ] ####################################################################

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
export type BuyTradeStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';
export type BuyTradeErrorKind = 'validation' | 'conflict' | 'rate-limit' | 'timeout' | 'server' | 'network';

export interface SubmitBuyTradeInput {
    quantity: number;
    ticker: string;
}

export interface BuyTradeOrder {
    averageFillPrice: string | null;
    broker: string;
    brokerOrderId: string | null;
    clientOrderId: string;
    filledQuantity: number | null;
    mode: 'paper' | 'live';
    orderType: 'market' | 'limit';
    quantity: number;
    status: string;
    submittedAt: string;
    ticker: string;
}

interface BuyTradeRejection {
    kind: BuyTradeErrorKind;
    message: string;
}

interface BuyTradeApiResponse {
    data?: {
        order?: {
            averageFillPrice?: string | null;
            broker?: string;
            brokerOrderId?: string | null;
            clientOrderId?: string;
            filledQuantity?: number | null;
            mode?: 'paper' | 'live';
            orderType?: 'market' | 'limit';
            quantity?: number;
            status?: string;
            submittedAt?: string;
            ticker?: string;
        };
    };
    error?: {
        message?: string;
    };
}

interface BuyTradeState {
    errorKind: BuyTradeErrorKind | null;
    errorMessage: string | null;
    lastOrder: BuyTradeOrder | null;
    status: BuyTradeStatus;
}
// 1.3. END ..........................................................................................

// 1.4. INITIAL STATE ................................................................................
const initialState: BuyTradeState = {
    errorKind: null,
    errorMessage: null,
    lastOrder: null,
    status: 'idle',
};
// 1.4. END ..........................................................................................

// 1.5. HELPERS ......................................................................................
function errorKindForStatus(status: number): BuyTradeErrorKind {
    switch (status) {
        case 400:
        case 422:
            return 'validation';
        case 409:
            return 'conflict';
        case 429:
            return 'rate-limit';
        case 504:
            return 'timeout';
        default:
            return 'server';
    }
}
// 1.5. END ..........................................................................................

// 1.6. THUNK ........................................................................................
export const submitBuyTrade = createAsyncThunk<
    BuyTradeOrder,
    SubmitBuyTradeInput,
    { rejectValue: BuyTradeRejection }
>('buyTrade/submit', async ({ quantity, ticker }, { rejectWithValue }) => {
    let response: Response;

    try {
        response = await fetch('/api/trades/buy', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                [CORRELATION_ID_HEADER]: createCorrelationId(),
            },
            body: JSON.stringify({
                mode: 'paper',
                orderType: 'market',
                quantity,
                side: 'buy',
                ticker,
            }),
        });
    } catch {
        return rejectWithValue({
            kind: 'network',
            message: 'We could not reach the trade service. Check your connection and try again.',
        });
    }

    const payload = await response.json().catch(() => null) as BuyTradeApiResponse | null;

    if (!response.ok) {
        return rejectWithValue({
            kind: errorKindForStatus(response.status),
            message: payload?.error?.message ?? 'The paper trade could not be submitted.',
        });
    }

    const order = payload?.data?.order;

    return {
        averageFillPrice: order?.averageFillPrice ?? null,
        broker: order?.broker ?? 'alpaca',
        brokerOrderId: order?.brokerOrderId ?? null,
        clientOrderId: order?.clientOrderId ?? '—',
        filledQuantity: order?.filledQuantity ?? null,
        mode: order?.mode ?? 'paper',
        orderType: order?.orderType ?? 'market',
        quantity: order?.quantity ?? quantity,
        status: order?.status ?? 'accepted',
        submittedAt: order?.submittedAt ?? '',
        ticker: order?.ticker ?? ticker,
    };
});
// 1.6. END ..........................................................................................

// 1.7. SLICE ........................................................................................
const buyTradeSlice = createSlice({
    name: 'buyTrade',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(submitBuyTrade.pending, (state) => {
                state.status = 'submitting';
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(submitBuyTrade.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.lastOrder = action.payload;
                state.errorKind = null;
                state.errorMessage = null;
            })
            .addCase(submitBuyTrade.rejected, (state, action) => {
                state.status = 'failed';
                state.errorKind = action.payload?.kind ?? 'server';
                state.errorMessage = action.payload?.message ?? 'The paper trade could not be submitted.';
            });
    },
});
// 1.7. END ..........................................................................................

export default buyTradeSlice.reducer;

// END FILE ##########################################################################################
