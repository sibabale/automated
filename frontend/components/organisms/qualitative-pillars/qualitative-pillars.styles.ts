// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS ] ##################################################

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
export const QualitativePillarsContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        padding-top: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
    `}
`;

export const QualitativePillarsHeading = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const QualitativePillarsSummary = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: 1.6;
    overflow-wrap: anywhere;
`;

export const QualitativePillarsGrid = styled.div`
    display: grid;
    grid-auto-rows: 1fr;
    gap: ${({ theme }) => theme.spacing.m};
    grid-template-columns: minmax(0, 1fr);

    ${media.up('md')`
        grid-template-columns: repeat(2, minmax(0, 1fr));
    `}
`;

export const QualitativePillarsLoadingTitle = styled.div`
    width: ${({ theme }) => `calc(${theme.size[20]} + ${theme.size[20]} + ${theme.size[20]})`};
    height: ${({ theme }) => theme.fontSizes.sm};
    background-color: ${({ theme }) => theme.background.loader};
`;

export const QualitativePillarsLoadingSummary = styled.div`
    width: 100%;
    height: ${({ theme }) => `calc(${theme.fontSizes.md} + ${theme.spacing.s})`};
    background-color: ${({ theme }) => theme.background.loader};
`;

export const QualitativePillarsLoadingCard = styled.div`
    min-height: ${({ theme }) => `calc(${theme.size[20]} + ${theme.size[20]})`};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
`;

export const QualitativePillarsStateContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
`;

export const QualitativePillarsStateTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    line-height: 1.3;
    overflow-wrap: anywhere;
`;

export const QualitativePillarsStateDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.5;
    overflow-wrap: anywhere;
`;

export const QualitativePillarsRetryButton = styled.button`
    justify-self: start;
    padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
    border: 1px solid ${({ theme }) => theme.border.strong};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    cursor: pointer;
`;
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
