// [ REDUX > SLICES > THEME ] ######################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// 1.1. END ........................................................................................

// 1.2. TYPES ......................................................................................
export type TThemeMode = 'light' | 'dark';

interface IThemeState {
    mode: TThemeMode;
}
// 1.2. END ........................................................................................

// 1.3. INITIAL STATE ..............................................................................
const initialState: IThemeState = {
    mode: 'light',
};
// 1.3. END ........................................................................................

// 1.4. SLICE ......................................................................................
const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode(state, action: PayloadAction<TThemeMode>) {
            state.mode = action.payload;
        },
    },
});
// 1.4. END ........................................................................................

export const { setThemeMode } = themeSlice.actions;

export default themeSlice.reducer;

// END FILE ########################################################################################
