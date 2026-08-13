// [ COMPONENTS > ORGANISMS > EDUCATIONAL SECTION ] #################################################

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
export const EducationalSectionContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xl};
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.m};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        grid-template-columns: minmax(0, 1.65fr) minmax(0, 0.95fr);
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl} ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.xl}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const EducationalCopy = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.l};
`;

export const EducationalLoadingCopy = styled.div`
    min-height: 14rem;

    > svg {
        display: block;
        height: 14rem;
    }

    ${media.up('md')`
        min-height: 21.125rem;

        > svg {
            height: 21.125rem;
        }
    `}
`;

export const EducationalContentGroup = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};
`;

export const EducationalTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.3;
    text-transform: uppercase;
`;

export const EducationalText = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.55;
`;

export const EducationalDesktopOnly = styled.div`
    display: none;

    ${media.up('md')`
        display: grid;
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.s};
    `}
`;

export const EducationalMobileOnly = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.55;

    ${media.up('md')`
        display: none;
    `}
`;

export const EducationalQuote = styled.blockquote`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};
    margin: 0;
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.strong};
    background-color: ${({ theme }) => theme.background.surface};
    color: ${({ theme }) => theme.text.primary};

    ${media.up('md')`
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
    `}
`;

export const EducationalLoadingQuote = styled.blockquote`
    display: grid;
    box-sizing: border-box;
    height: 13.1875rem;
    margin: 0;
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.strong};
    background-color: ${({ theme }) => theme.background.surface};

    > svg {
        display: block;
        width: 100%;
        height: 100%;
    }

    ${media.up('md')`
        height: 21.125rem;
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};

        > svg {
            height: 100%;
        }
    `}
`;

export const QuoteMark = styled.span`
    color: ${({ theme }) => theme.border.subtle};
    font-size: ${({ theme }) => theme.fontSizes.hero};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 0.5;

    ${media.up('md')`
        display: block;
    `}

    @media (max-width: 767px) {
        display: none;
    }
`;

export const QuoteText = styled.p`
    display: none;
    margin: ${({ theme }) => theme.spacing.s} 0 0;
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    line-height: 1.45;

    ${media.up('md')`
        display: block;
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.lg};
    `}
`;

export const QuoteMobileText = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    line-height: 1.45;

    ${media.up('md')`
        display: none;
    `}
`;

export const QuoteAuthor = styled.cite`
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
    margin-top: ${({ theme }) => theme.spacing.s};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-style: normal;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const QuoteAuthorTitle = styled.span`
    color: ${({ theme }) => theme.text.tertiary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.regular};

    @media (max-width: 767px) {
        display: none;
    }
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
