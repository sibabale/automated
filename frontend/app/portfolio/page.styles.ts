// [ APP > PORTFOLIO PAGE ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';
import { motion } from 'motion/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../../theme';
import type { ITheme } from '../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
export const PortfolioContainer = styled.div`
    min-height: 100vh;
    background-color: ${({ theme }) => theme.background.primary};
`;

export const PortfolioContent = styled.main`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xl};
    width: 100%;
    max-width: ${({ theme }) => `calc(${theme.size[160]} + ${theme.size[160]})`};
    margin: 0 auto;
    padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.m}`};

    > section[aria-label='Portfolio metrics'] {
        display: none;
    }

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
        padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};

        > section[aria-label='Portfolio metrics'] {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: ${({ theme }: { theme: ITheme }) => theme.spacing.m};
        }
    `}

    ${media.up('xl')`
        > section[aria-label='Portfolio metrics'] {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    `}
`;

export const PortfolioHeader = styled.header`
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
`;

export const PortfolioHeaderContent = styled.div`
    display: grid;
    width: 100%;
    max-width: ${({ theme }) => `calc(${theme.size[160]} + ${theme.size[160]})`};
    gap: ${({ theme }) => theme.spacing.xs};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing.l} ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.xl} ${theme.spacing.xl}`};
    `}
`;

export const PortfolioHeading = styled.h1`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.hero};
    `}
`;

export const PortfolioSubtitle = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;
`;

export const PortfolioMobileMetrics = styled.div`
    ${media.up('md')`
        display: none;
    `}
`;

export const PortfolioSectionTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const PortfolioHoldings = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const PortfolioHoldingsTable = styled.table`
    display: none;

    ${media.up('md')`
        display: table;
        width: 100%;
        border-collapse: collapse;
        border: 1px solid ${({ theme }: { theme: ITheme }) => theme.border.default};

    `}
`;

export const PortfolioHoldingsTableBody = styled(motion.tbody)``;

export const PortfolioHoldingCards = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};

    ${media.up('md')`
        display: none;
    `}
`;

export const PortfolioHoldingCard = styled.article`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: ${({ theme }) => theme.spacing.s};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.xs};
    background-color: ${({ theme }) => theme.background.surface};

    dl {
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${({ theme }) => theme.spacing.xs};
        margin: 0;
        padding-top: ${({ theme }) => theme.spacing.xs};
        border-top: 1px solid ${({ theme }) => theme.border.default};
    }

    dl:last-child {
        grid-template-columns: 1fr 1fr;
    }

    dt {
        color: ${({ theme }) => theme.text.tertiary};
        font-size: ${({ theme }) => theme.fontSizes.xs};
        font-weight: ${({ theme }) => theme.fontWeights.bold};
        text-transform: uppercase;
    }

    dd {
        margin: ${({ theme }) => `${theme.spacing.ss} 0 0`};
        color: ${({ theme }) => theme.text.primary};
        font-size: ${({ theme }) => theme.fontSizes.sm};
        font-weight: ${({ theme }) => theme.fontWeights.bold};
    }

`;

export const PortfolioHoldingCardLoadingContent = styled.div`
    grid-column: 1 / -1;
    min-width: 0;
`;

export const PortfolioHoldingName = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};

    span {
        margin-left: ${({ theme }) => theme.spacing.ss};
        color: ${({ theme }) => theme.text.secondary};
        font-size: ${({ theme }) => theme.fontSizes.xs};
        font-weight: ${({ theme }) => theme.fontWeights.regular};
    }
`;

export const PortfolioHoldingScore = styled.span`
    align-self: start;
    padding: ${({ theme }) => `${theme.spacing.ss} ${theme.spacing.xs}`};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.ss};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

// 1.6. END ........................................................................................

// END FILE ########################################################################################
