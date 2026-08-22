// [ COMPONENTS > MOLECULES > RUNS SUMMARY CARD ] ####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../../../theme';
import type { ITheme } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. STYLES .......................................................................................
export const RunsSummaryCardContainer = styled.article`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
    min-height: ${({ theme }) => theme.size[20]};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        min-height: ${({ theme }: { theme: ITheme }) => theme.size[26]};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.l};
    `}
`;

export const RunsSummaryLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.25;
    text-transform: uppercase;
`;

export const RunsSummaryValue = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxxl};
    `}
`;

export const RunsSummaryDescription = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;
`;
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
