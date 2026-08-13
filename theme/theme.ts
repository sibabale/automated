import type { ITheme, IThemeSpacing, IThemeSize, IThemeBreakpoints, IThemeFontWeights, IThemeFontSizes } from './theme.types';
import { breakpoints as bp } from './media';

const spacing: IThemeSpacing = {
    ss:  '4px',
    xs:  '8px',
    s:   '12px',
    m:   '16px',
    l:   '24px',
    xl:  '32px',
    xxl: '48px',
};

const size: IThemeSize = {
    5:   '20px',
    11:  '44px',
    12:  '48px',
    20:  '80px',
    26:  '104px',
    160: '640px',
};

const breakpoints: IThemeBreakpoints = bp;

const fontWeights: IThemeFontWeights = {
    thin:       100,
    extraLight: 200,
    light:      300,
    regular:    400,
    medium:     500,
    semiBold:   600,
    bold:       700,
    extraBold:  800,
    black:      900,
};

const fontSizes: IThemeFontSizes = {
    xs:   '12px',
    sm:   '14px',
    md:   '16px',
    lg:   '18px',
    xl:   '20px',
    xxl:  '24px',
    xxxl: '32px',
    hero: '48px',
};

export const lightTheme: ITheme = {
    spacing,
    size,
    breakpoints,
    fontWeights,
    fontSizes,
    text: {
        primary: '#111827',
        secondary: '#4B5563',
        tertiary: '#6B7280',
        inverse: '#F1F5F9',
    },
    background: {
        primary: '#FAFBFC',
        surface: '#F4F5F7',
        loader: '#E5E7EB',
        inverse: '#1E293B',
    },
    border: {
        default: '#E2E8F0',
        strong: '#1E293B',
        medium: '#64748B',
        subtle: '#CBD5E1',
    },
    status: {
        positive: {
            background: '#F0FDF4',
            border: '#86EFAC',
            icon: '#29B56B',
        },
        negative: {
            background: '#FCE3E3',
            border: '#FCA5A5',
            icon: '#C42B2B',
        },
        error: {
            background: '#FEF2F2',
            icon: '#EF4444',
        },
        muted: '#94A3B8',
    },
};

export const darkTheme: ITheme = {
    spacing,
    size,
    breakpoints,
    fontWeights,
    fontSizes,
    text: {
        primary: '#F1F5F9',
        secondary: '#9CA3AF',
        tertiary: '#6B7280',
        inverse: '#111827',
    },
    background: {
        primary: '#111827',
        surface: '#1E293B',
        loader: '#334155',
        inverse: '#F1F5F9',
    },
    border: {
        default: '#334155',
        strong: '#E2E8F0',
        medium: '#64748B',
        subtle: '#475569',
    },
    status: {
        positive: {
            background: '#133B2A',
            border: '#237A4B',
            icon: '#5EE89A',
        },
        negative: {
            background: '#471C24',
            border: '#8F3542',
            icon: '#FF8A8A',
        },
        error: {
            background: '#471C24',
            icon: '#FF8A8A',
        },
        muted: '#94A3B8',
    },
};

// Keep default export as the light theme for backward-compatibility.
const theme = { light: lightTheme, dark: darkTheme };

export default theme;