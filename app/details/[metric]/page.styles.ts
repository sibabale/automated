// [ APP > DETAILS PAGE ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
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
export const DetailPageMain = styled.main`
    display: grid;
    min-height: 100%;
    background-color: ${({ theme }) => theme.background.surface};
`;

export const DetailContentFlow = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};
    padding-bottom: ${({ theme }) => theme.spacing.xl};

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.l};
        padding-bottom: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
    `}

    ${media.up('lg')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
    `}
`;

export const HorizonAnalysisSection = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.l};
    padding: ${({ theme }) => theme.spacing.l} ${({ theme }) => theme.spacing.m};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl} ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.xl}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const HorizonAnalysisTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xl};
    `}
`;

export const HorizonAnalysisGrid = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        grid-template-columns: repeat(2, minmax(0, 1fr));
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
