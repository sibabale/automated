// [ COMPONENTS > ORGANISMS > FOOTER ] ###############################################################

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
export const FooterContainer = styled.footer`
    border-top: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.surface};
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;
`;

export const FooterContent = styled.div`
    display: grid;
    width: 100%;
    max-width: ${({ theme }) => `calc(${theme.size[160]} + ${theme.size[160]})`};
    gap: ${({ theme }) => theme.spacing.xs};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing.m};
    text-align: center;

    ${media.up('md')`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.l};
        padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.m} ${theme.spacing.xl}`};
        text-align: left;
    `}
`;

export const FooterBrand = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.extraBold};
`;

export const FooterCopyright = styled.span`
    overflow-wrap: anywhere;
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
