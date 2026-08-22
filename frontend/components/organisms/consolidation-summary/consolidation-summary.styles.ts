// [ COMPONENTS > ORGANISMS > CONSOLIDATION SUMMARY ] ################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../../../theme';
import type { ITheme } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. FUNCTIONS ....................................................................................
// 1.5. END ..........................................................................................

// 1.6. STYLES .......................................................................................
export const ConsolidationSummaryContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
    padding: ${({ theme }) => theme.spacing.m};
    background-color: ${({ theme }) => theme.background.surface};

    ${media.up('md')`
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl} ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.xl}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const ConsolidationTitle = styled.h2`
    grid-column: 1 / -1;
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const ConsolidationMobileCalculation = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    line-height: 1.4;

    ${media.up('md')`
        display: none;
    `}
`;

export const ConsolidationDesktopCalculation = styled.div`
    display: none;

    ${media.up('md')`
        display: flex;
        align-items: center;
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.m};
        color: ${({ theme }: { theme: ITheme }) => theme.text.primary};
        font-family: ${({ theme }: { theme: ITheme }) => theme.fonts.math};
        font-style: italic;
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.lg};
        font-weight: ${({ theme }: { theme: ITheme }) => theme.fontWeights.regular};
    `}
`;

export const ConsolidationFraction = styled.span`
    display: inline-grid;
    text-align: center;
`;

export const ConsolidationNumerator = styled.span`
    padding: 0 ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.ss};
    border-bottom: 1px solid ${({ theme }) => theme.text.primary};
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
`;

export const ConsolidationDenominator = styled.span`
    padding: ${({ theme }) => theme.spacing.ss} ${({ theme }) => theme.spacing.xs} 0;
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
`;

export const ConsolidationResult = styled.strong`
    font-family: ${({ theme }) => theme.fonts.math};
    font-style: italic;
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    font-size: ${({ theme }) => theme.fontSizes.xxxl};
`;

export const ConsolidationNote = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};
    color: ${({ theme }) => theme.text.secondary};

    ${media.up('md')`
        padding-left: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        border-left: 1px solid ${({ theme }: { theme: ITheme }) => theme.border.default};
    `}
`;

export const ConsolidationNoteLabel = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const ConsolidationNoteText = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.45;
`;

export const ConsolidationLoadingNoteText = styled(ConsolidationNoteText)`
    min-height: 7.8125rem;

    > svg:first-child {
        display: block;
        height: 7.8125rem;
    }

    > svg:last-child {
        display: none;
    }

    ${media.up('md')`
        min-height: 4rem;

        > svg:first-child {
            display: none;
        }

        > svg:last-child {
            display: block;
            height: 4rem;
        }
    `}
`;

export const ConsolidationDesktopNote = styled.span`
    display: none;

    ${media.up('md')`
        display: inline;
    `}
`;

export const ConsolidationMobileNote = styled.span`
    ${media.up('md')`
        display: none;
    `}
`;
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
