// [ COMPONENTS > MOLECULES > PORTFOLIO SUMMARY CARD ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../../../theme';
import type { ITheme } from '../../../theme';
import type { TTrendBadgeVariant } from '../../atoms/trend-badge/trend-badge.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. FUNCTIONS ....................................................................................
// 1.5. END ..........................................................................................

// 1.6. STYLES .......................................................................................
export const PortfolioSummaryCardContainer = styled.article`
    display: grid;
    align-content: start;
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

export const PortfolioSummaryLabel = styled.p`
    max-width: 14ch;
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.25;
    overflow-wrap: anywhere;
    text-transform: uppercase;

    ${media.up('md')`
        max-width: 16ch;
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.sm};
        line-height: 1.3;
    `}
`;

export const PortfolioSummaryValue = styled.strong<{ $trend?: TTrendBadgeVariant }>`
    color: ${({ $trend, theme }) => (
        $trend ? theme.status[$trend === 'up' ? 'positive' : 'negative'].icon : theme.text.primary
    )};
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: -0.04em;
    line-height: 1;
    overflow-wrap: anywhere;

    ${media.up('md')`
        font-size: clamp(
            ${({ theme }: { theme: ITheme }) => theme.fontSizes.xl},
            2.5vw,
            ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxxl}
        );
    `}
`;

export const PortfolioSummaryDescription = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;
`;
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
