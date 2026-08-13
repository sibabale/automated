// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS ] ##################################################

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

export const QualitativePillarsLoadingCard = styled.div`
    min-height: ${({ theme }) => `calc(${theme.size[20]} + ${theme.size[20]})`};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
