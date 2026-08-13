// [ COMPONENTS > MOLECULES > METRIC CARD ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import Link from 'next/link';
import styled from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../../../theme';
import type { ITheme } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
export const MetricCardContainer = styled(Link)`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.s};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
    color: inherit;
    text-decoration: none;

    ${media.up('md')`
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.m};
    `}
`;

export const MetricLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: clamp(
        ${({ theme }) => theme.fontSizes.xs},
        1.25vw,
        ${({ theme }) => theme.fontSizes.sm}
    );
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    line-height: 1.2;
    overflow-wrap: anywhere;
    text-transform: uppercase;
`;

export const MetricValue = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: clamp(
        ${({ theme }) => theme.fontSizes.xl},
        2.5vw,
        ${({ theme }) => theme.fontSizes.xxxl}
    );
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;
    overflow-wrap: anywhere;
`;

export const MetricDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.4;
    overflow-wrap: anywhere;
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
