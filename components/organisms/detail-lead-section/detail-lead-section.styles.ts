// [ COMPONENTS > ORGANISMS > DETAIL LEAD SECTION ] #################################################

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
export const DetailLeadSectionContainer = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${({ theme }) => theme.spacing.l};
    padding: ${({ theme }) => theme.spacing.l} ${({ theme }) => theme.spacing.m};
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl} ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.m}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const DetailLeadBackLink = styled(Link)`
    grid-column: 1 / -1;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    text-decoration: none;

    &:hover {
        color: ${({ theme }) => theme.text.primary};
    }

    ${media.up('md')`
        display: none;
    `}
`;

export const DetailLeadContent = styled.div`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.xs};
`;

export const DetailLeadCompany = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.sm};
    `}
`;

export const DetailLeadTitle = styled.h1`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;
    overflow-wrap: anywhere;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.hero};
    `}
`;

export const DetailLeadDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;

    ${media.up('md')`
        display: none;
    `}
`;

export const DetailLeadMetric = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
    text-align: right;
`;

export const DetailLeadValue = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.hero};
    `}
`;

export const DetailLeadMetricDescription = styled.p`
    display: none;
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;

    ${media.up('md')`
        display: block;
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
