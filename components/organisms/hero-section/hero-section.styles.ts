// [ COMPONENTS > ORGANISMS > HERO SECTION ] #########################################################

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
export const HeroSectionContainer = styled.section`
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    padding: 0;
    background-color: ${({ theme }) => theme.background.primary};
    text-align: left;

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xs};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl} 0 ${({ theme }: { theme: ITheme }) => theme.spacing.ss};
        text-align: center;
    `}
`;

export const HeroHeading = styled.h1`
    max-width: 100%;
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxxl};
    `}
`;

export const HeroMobileHeading = styled.span`
    display: block;

    ${media.up('md')`
        display: none;
    `}
`;

export const HeroDesktopHeading = styled.span`
    display: none;

    ${media.up('md')`
        display: block;
    `}
`;

export const HeroDescription = styled.p`
    display: none;
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: 1.4;

    ${media.up('md')`
        display: block;
    `}
`;

export const HeroSearchContainer = styled.div`
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.s};

    ${media.up('md')`
        max-width: ${({ theme }: { theme: ITheme }) => theme.size[160]};
        margin-top: ${({ theme }: { theme: ITheme }) => theme.spacing.l};
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
