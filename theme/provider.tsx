'use client';

// [ THEME > PROVIDER ] ############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { darkTheme, lightTheme } from './theme';
import type { ITheme } from './theme.types';
// 1.2. END ........................................................................................

// 1.3. TYPES ......................................................................................
interface IStyledThemeProvider {
    children: React.ReactNode;
    defaultMode?: 'light' | 'dark';
}
// 1.3. END ........................................................................................

type TColorMode = 'light' | 'dark';

interface IColorModeContext {
    mode: TColorMode;
    setMode: (mode: TColorMode) => void;
}

const ColorModeContext = createContext<IColorModeContext | null>(null);

export const useColorMode = (): IColorModeContext => {
    const colorMode = useContext(ColorModeContext);

    if (!colorMode) {
        throw new Error('useColorMode must be used within StyledThemeProvider.');
    }

    return colorMode;
};

// 1.4. COMPONENT ..................................................................................

const StyledThemeProvider: React.FC<IStyledThemeProvider> = ({
    children,
    defaultMode = 'light',
}) => {
    // 1.4.1. HOOKS ....................................................................................
    const [mode, setMode] = useState<TColorMode>(defaultMode);

    const activeTheme: ITheme = mode === 'dark' ? darkTheme : lightTheme;
    // 1.4.1. END ......................................................................................

    // 1.4.2. RENDER ...................................................................................
    return (
        <ColorModeContext.Provider value={{ mode, setMode }}>
            <ThemeProvider theme={activeTheme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
    // 1.4.2. END ......................................................................................
};

// 1.4. END ........................................................................................

export default StyledThemeProvider;

// END FILE ########################################################################################
