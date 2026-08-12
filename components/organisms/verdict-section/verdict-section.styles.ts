// [ COMPONENTS > ORGANISMS > VERDICT SECTION ] ######################################################

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
export const VerdictSectionContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};
    margin-top: ${({ theme }) => theme.spacing.m};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.surface};

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.m};
        margin-top: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.l};
    `}
`;

export const VerdictSummary = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const VerdictLabel = styled.span`
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.s};
    background-color: ${({ theme }) => theme.background.inverse};
    color: ${({ theme }) => theme.text.inverse};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const VerdictTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    overflow-wrap: anywhere;
`;

export const VerdictDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: 1.5;
    overflow-wrap: anywhere;
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
