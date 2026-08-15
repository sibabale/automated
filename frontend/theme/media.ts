// [ THEME > MEDIA ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { css, RuleSet } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. BREAKPOINTS ................................................................................

// Mobile-first pixel breakpoints.
// All media queries use `min-width` so styles cascade upward from the
// smallest viewport — only override what changes at each breakpoint.
export const breakpoints = {
    xs:  320,   // small phones (iPhone SE)
    sm:  576,   // large phones / landscape phones
    md:  768,   // tablets (portrait)
    lg:  1024,  // tablets (landscape) / small laptops
    xl:  1280,  // desktops / large laptops
    xxl: 1536,  // wide / large desktops
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 1.2. END ........................................................................................

// 1.3. MEDIA QUERY HELPERS ........................................................................

// `up(bp)` — applies styles at `bp` and above (min-width).
// Usage:
//   ${media.up('md')`
//     font-size: 18px;
//   `}
export const media = {
    up: (bp: Breakpoint) =>
        (styles: TemplateStringsArray, ...interpolations: unknown[]): RuleSet =>
            css`
                @media (min-width: ${breakpoints[bp]}px) {
                    ${css(styles as TemplateStringsArray, ...(interpolations as RuleSet[]))}
                }
            `,

    // `down(bp)` — applies styles below `bp` (max-width uses bp - 0.02px to
    // avoid overlap with the `up` query at the same breakpoint).
    down: (bp: Breakpoint) =>
        (styles: TemplateStringsArray, ...interpolations: unknown[]): RuleSet =>
            css`
                @media (max-width: ${breakpoints[bp] - 0.02}px) {
                    ${css(styles as TemplateStringsArray, ...(interpolations as RuleSet[]))}
                }
            `,

    // `between(min, max)` — applies styles between two breakpoints (inclusive min, exclusive max).
    between: (min: Breakpoint, max: Breakpoint) =>
        (styles: TemplateStringsArray, ...interpolations: unknown[]): RuleSet =>
            css`
                @media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 0.02}px) {
                    ${css(styles as TemplateStringsArray, ...(interpolations as RuleSet[]))}
                }
            `,

    // `only(bp)` — applies styles only within a single breakpoint band.
    only: (bp: Breakpoint) => {
        const keys = Object.keys(breakpoints) as Breakpoint[];
        const nextIndex = keys.indexOf(bp) + 1;
        const next = keys[nextIndex] as Breakpoint | undefined;

        return (styles: TemplateStringsArray, ...interpolations: unknown[]): RuleSet =>
            next
                ? css`
                    @media (min-width: ${breakpoints[bp]}px) and (max-width: ${breakpoints[next] - 0.02}px) {
                        ${css(styles as TemplateStringsArray, ...(interpolations as RuleSet[]))}
                    }
                  `
                : css`
                    @media (min-width: ${breakpoints[bp]}px) {
                        ${css(styles as TemplateStringsArray, ...(interpolations as RuleSet[]))}
                    }
                  `;
    },
} as const;

// 1.3. END ........................................................................................

// END FILE ########################################################################################
