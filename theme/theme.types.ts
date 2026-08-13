// [ THEME > TYPES ] ###############################################################################

// 1.1. TYPES ..........................................................................................

export interface IThemeSpacing {
    xxxs: string; // extra extra extra small — 2px
    ss:  string;  // super small  — 4px
    xs:  string;  // extra small  — 8px
    s:   string;  // small        — 12px
    m:   string;  // medium       — 16px
    l:   string;  // large        — 24px
    xl:  string;  // extra large  — 32px
    xxl: string;  // extra extra large — 48px
}

export interface IThemeSize {
    5:   string; // 20px
    11:  string; // 44px
    12:  string; // 48px
    20:  string; // 80px
    26:  string; // 104px
    160: string; // 640px
}

export interface IThemeFontSizes {
    xs:   string; // 12px — captions, labels
    sm:   string; // 14px — secondary text
    md:   string; // 16px — base / body (1rem)
    lg:   string; // 18px — large body
    xl:   string; // 20px — subheadings
    xxl:  string; // 24px — headings
    xxxl: string; // 32px — display
    hero: string; // 48px — hero / marketing
}

export interface IThemeFontWeights {
    thin:       number; // 100
    extraLight: number; // 200
    light:      number; // 300
    regular:    number; // 400
    medium:     number; // 500
    semiBold:   number; // 600
    bold:       number; // 700
    extraBold:  number; // 800
    black:      number; // 900
}

export interface IThemeBreakpoints {
    xs:  number;  // 320px  — small phones
    sm:  number;  // 576px  — large phones
    md:  number;  // 768px  — tablets portrait
    lg:  number;  // 1024px — tablets landscape / small laptops
    xl:  number;  // 1280px — desktops
    xxl: number;  // 1536px — wide desktops
}

export interface IThemeColors {
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
    };
    background: {
        primary: string;
        surface: string;
        loader: string;
        inverse: string;
    };
    border: {
        default: string;
        strong: string;
        medium: string;
        subtle: string;
    };
    status: {
        positive: {
            background: string;
            border: string;
            icon: string;
        };
        negative: {
            background: string;
            border: string;
            icon: string;
        };
        error: {
            background: string;
            icon: string;
        };
        muted: string;
    };
}

export interface ITheme extends IThemeColors {
    spacing:     IThemeSpacing;
    size:        IThemeSize;
    breakpoints: IThemeBreakpoints;
    fontWeights: IThemeFontWeights;
    fontSizes:   IThemeFontSizes;
}

// 1.1. END ............................................................................................

// 1.2. STYLED-COMPONENTS DECLARATION ..............................................................

// Augment the DefaultTheme so every styled-component automatically receives
// the typed theme object from ThemeProvider with no extra casting needed.
import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme extends ITheme {}
}

// 1.2. END ............................................................................................

// END FILE ########################################################################################
