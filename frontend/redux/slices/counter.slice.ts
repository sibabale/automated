// [ REDUX > SLICES > COUNTER ] ####################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
// 1.2. END ........................................................................................

// 1.3. TYPES ......................................................................................
interface CounterState {
    value: number;
}
// 1.3. END ........................................................................................

// 1.4. INITIAL STATE ..............................................................................
const initialState: CounterState = {
    value: 0,
};
// 1.4. END ........................................................................................

// 1.5. SLICE ......................................................................................
const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment(state) {
            state.value += 1;
        },
        decrement(state) {
            state.value -= 1;
        },
        incrementByAmount(state, action: PayloadAction<number>) {
            state.value += action.payload;
        },
        reset(state) {
            state.value = 0;
        },
    },
});
// 1.5. END ........................................................................................

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

export default counterSlice.reducer;

// END FILE ########################################################################################
