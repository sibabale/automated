'use client';

// [ THEME > PROVIDER ] ############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import React from 'react';
import { ThemeProvider } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { darkTheme, lightTheme } from './theme';
import type { ITheme } from './theme.types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setThemeMode } from '../redux/slices/theme.slice';
import type { TThemeMode } from '../redux/slices/theme.slice';
// 1.2. END ........................................................................................

// 1.3. TYPES ......................................................................................
interface IStyledThemeProvider {
    children: React.ReactNode;
}
// 1.3. END ........................................................................................

interface IColorModeContext {
    mode: TThemeMode;
    setMode: (mode: TThemeMode) => void;
}

// 1.4. COMPONENT ..................................................................................

const StyledThemeProvider: React.FC<IStyledThemeProvider> = ({ children }) => {
    // 1.4.1. HOOKS ....................................................................................
    const mode = useAppSelector((state) => state.theme.mode);

    const activeTheme: ITheme = mode === 'dark' ? darkTheme : lightTheme;
    // 1.4.1. END ......................................................................................

    // 1.4.2. RENDER ...................................................................................
    return (
        <ThemeProvider theme={activeTheme}>{children}</ThemeProvider>
    );
    // 1.4.2. END ......................................................................................
};

export const useColorMode = (): IColorModeContext => {
    const dispatch = useAppDispatch();
    const mode = useAppSelector((state) => state.theme.mode);

    return {
        mode,
        setMode: (nextMode) => dispatch(setThemeMode(nextMode)),
    };
};

// 1.4. END ........................................................................................

export default StyledThemeProvider;

// END FILE ########################################################################################
