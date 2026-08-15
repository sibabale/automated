// [ COMPONENTS > MOLECULES > HORIZON CARD ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled, { keyframes } from 'styled-components';
import { motion } from 'motion/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
export const HorizonCardContainer = styled(motion.article)`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.s};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: 0;
    background-color: ${({ theme }) => theme.background.primary};
`;

export const HorizonCardHeader = styled.div`
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const HorizonCardTitleGroup = styled.div`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.ss};
`;

export const HorizonCardTitle = styled.h3`
    margin: 0;
    color: ${({ theme }) => theme.text.tertiary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const HorizonCardRange = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.2;
`;

export const HorizonCardValue = styled.strong`
    min-width: max-content;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;
`;

const loadingPulse = keyframes`
    0%, 100% {
        opacity: 0.55;
    }

    50% {
        opacity: 1;
    }
`;

export const HorizonCardLoadingContainer = styled.article`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.s};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: 0;
    background-color: ${({ theme }) => theme.background.primary};
`;

export const HorizonCardLoadingHeader = styled.div`
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const HorizonCardLoadingTitleGroup = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
`;

export const HorizonCardSkeleton = styled.span<{ $height: string; $width: string }>`
    display: block;
    width: ${({ $width }) => $width};
    height: ${({ $height }) => $height};
    border-radius: ${({ theme }) => theme.spacing.ss};
    background-color: ${({ theme }) => theme.background.loader};
    animation: ${loadingPulse} 1.6s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

export const HorizonCardBreakdown = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.s};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.s};
    background-color: ${({ theme }) => theme.background.surface};
`;

export const HorizonCardBreakdownLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const HorizonCardBreakdownList = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    list-style: none;
`;

export const HorizonCardBreakdownItem = styled.li`
    position: relative;
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
    min-width: 0;

    & + & {
        padding-left: ${({ theme }) => theme.spacing.s};

        &::before {
            position: absolute;
            top: ${({ theme }) => `calc(${theme.spacing.s} - 1px)`};
            bottom: ${({ theme }) => `calc(${theme.spacing.s} - 1px)`};
            left: 0;
            width: 1px;
            background-color: ${({ theme }) => theme.border.subtle};
            content: '';
        }
    }
`;

export const HorizonCardBreakdownPeriod = styled.span`
    color: ${({ theme }) => theme.text.tertiary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
`;

export const HorizonCardBreakdownValue = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const HorizonCardInsight = styled.p`
    margin: 0;
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.spacing.xs};
    background-color: ${({ theme }) => theme.background.surface};
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.5;
`;

export const HorizonCardLoadingBreakdown = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.s};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.s};
    background-color: ${({ theme }) => theme.background.surface};
`;

export const HorizonCardLoadingBreakdownList = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
`;

export const HorizonCardLoadingBreakdownItem = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
    min-width: 0;

    & + & {
        position: relative;
        padding-left: ${({ theme }) => theme.spacing.s};

        &::before {
            position: absolute;
            top: ${({ theme }) => `calc(${theme.spacing.s} - 1px)`};
            bottom: ${({ theme }) => `calc(${theme.spacing.s} - 1px)`};
            left: 0;
            width: 1px;
            background-color: ${({ theme }) => theme.border.subtle};
            content: '';
        }
    }
`;

export const HorizonCardLoadingInsight = styled.div<{ $mobileInsightLines: 1 | 2 }>`
    min-height: ${({ $mobileInsightLines }) => ($mobileInsightLines === 2 ? '2.5rem' : '1.75rem')};
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.spacing.xs};
    background-color: ${({ theme }) => theme.background.surface};

    ${media.up('md')`
        min-height: 1.75rem;
    `}
`;

export const HorizonCardInsightIcon = styled.span`
    margin-right: ${({ theme }) => theme.spacing.ss};
    color: ${({ theme }) => theme.border.medium};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
