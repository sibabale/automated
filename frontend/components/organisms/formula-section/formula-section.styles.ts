// [ COMPONENTS > ORGANISMS > FORMULA SECTION ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { ITheme } from '../../../theme';
import { media, pressableBounce } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. FUNCTIONS ....................................................................................
// 1.5. END ..........................................................................................

// 1.6. STYLES .......................................................................................
export const FormulaSectionContainer = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${({ theme }) => theme.spacing.xl};
    padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        grid-template-columns: minmax(15rem, 0.8fr) minmax(0, 1.8fr);
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl} ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.xl}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const FormulaIntro = styled.div`
    display: grid;
    align-content: start;
    gap: ${({ theme }) => theme.spacing.l};
`;

export const FormulaIntroLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.tertiary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
`;

export const FormulaSectionTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: -0.04em;
    line-height: 1.08;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxxl};
    `}
`;

export const FormulaContent = styled.div`
    min-width: 0;
`;

export const FormulaLoadingIntro = styled.div`
    min-width: 0;
    min-height: 8.9375rem;

    > svg {
        display: block;
        height: 8.9375rem;
    }

    ${media.up('md')`
        min-height: 9.25rem;

        > svg {
            height: 9.25rem;
        }
    `}
`;

export const FormulaLoadingContent = styled.div`
    min-width: 0;
    min-height: 9.5rem;

    > svg {
        display: block;
        height: 9.5rem;
    }

    ${media.up('md')`
        min-height: 12.875rem;

        > svg {
            height: 12.875rem;
        }
    `}
`;

export const FormulaPanels = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.l};
`;

export const FormulaPanel = styled.div`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.s};

    & + & {
        padding-top: ${({ theme }) => theme.spacing.l};
        border-top: 1px solid ${({ theme }) => theme.border.default};
    }
`;

export const FormulaPanelLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: 0.02em;
    line-height: 1.2;
    text-transform: uppercase;
`;

export const FormulaExpression = styled.div`
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.ss};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    line-height: 1.2;

    > span,
    > strong {
        font-family: ${({ theme }) => theme.fonts.math};
        font-style: italic;
        font-weight: ${({ theme }) => theme.fontWeights.regular};
    }

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xs};
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.lg};
    `}
`;

export const FormulaFraction = styled.span`
    display: inline-grid;
    min-width: max-content;
    text-align: center;
`;

export const FormulaNumerator = styled.span`
    padding: 0 ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.ss};
    border-bottom: 1px solid ${({ theme }) => theme.text.primary};
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
`;

export const FormulaDenominator = styled.span`
    padding: ${({ theme }) => theme.spacing.ss} ${({ theme }) => theme.spacing.xs} 0;
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
`;

export const FormulaResult = styled.strong`
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    font-size: ${({ theme }) => theme.fontSizes.lg};

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxl};
    `}
`;

export const FormulaFootnote = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.4;
`;

export const FormulaStateContainer = styled.section`
    display: grid;
    min-height: 19rem;
    place-content: center;
    justify-items: center;
    gap: ${({ theme }) => theme.spacing.s};
    padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.secondary};
    text-align: center;
`;

export const FormulaStateIcon = styled.span<{ $variant: 'empty' | 'error' }>`
    display: grid;
    width: ${({ theme }) => theme.size[12]};
    height: ${({ theme }) => theme.size[12]};
    place-items: center;
    border-radius: 50%;
    color: ${({ theme, $variant }) => ($variant === 'error' ? theme.status.error.icon : theme.status.muted)};
    background-color: ${({ theme, $variant }) => ($variant === 'error' ? theme.status.error.background : 'transparent')};
    border: ${({ $variant, theme }) => ($variant === 'empty' ? `1px dashed ${theme.border.subtle}` : 'none')};
`;

export const FormulaStateTitle = styled.h2`
    margin: ${({ theme }) => `${theme.spacing.s} 0 0`};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: -0.03em;
    line-height: 1.15;
`;

export const FormulaStateMessage = styled.p`
    max-width: 29rem;
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-family: var(--font-geist-sans), sans-serif;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.5;
`;

export const FormulaStateAction = styled.button`
    ${pressableBounce}
    border: 1px solid ${({ theme }) => theme.border.strong};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.primary};
    cursor: pointer;
    font: inherit;
    margin-top: ${({ theme }) => theme.spacing.s};
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.s}`};
`;
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
