// [ COMPONENTS > ORGANISMS > FORMULA SECTION ] #####################################################

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
export const FormulaSectionContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.l};
    padding: ${({ theme }) => theme.spacing.l} ${({ theme }) => theme.spacing.m};
    background-color: ${({ theme }) => theme.background.surface};

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl} ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.xl}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const FormulaSectionTitle = styled.h2`
    display: none;
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;

    ${media.up('md')`
        display: block;
    `}
`;

export const FormulaPanels = styled.div`
    display: none;
    gap: ${({ theme }) => theme.spacing.xl};

    ${media.up('md')`
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    `}
`;

export const FormulaMobileSummary = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};

    ${media.up('md')`
        display: none;
    `}
`;

export const FormulaMobileTitle = styled.h2`
    margin: 0 0 ${({ theme }) => theme.spacing.ss};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const FormulaMobileLine = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    line-height: 1.4;
`;

export const FormulaMobileLineLabel = styled.span`
    margin-right: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.text.secondary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

export const FormulaPanel = styled.div<{ $withDivider?: boolean }>`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.m};

    ${({ $withDivider, theme }) => $withDivider && media.up('md')`
        padding-left: ${theme.spacing.xl};
        border-left: 1px solid ${theme.border.default};
    `}
`;

export const FormulaPanelLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const FormulaExpression = styled.div`
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.s};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xl};
    `}
`;

export const FormulaFraction = styled.span`
    display: inline-grid;
    min-width: max-content;
    text-align: center;
`;

export const FormulaNumerator = styled.span`
    padding: 0 ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.ss};
    border-bottom: 1px solid ${({ theme }) => theme.text.primary};
`;

export const FormulaDenominator = styled.span`
    padding: ${({ theme }) => theme.spacing.ss} ${({ theme }) => theme.spacing.xs} 0;
`;

export const FormulaResult = styled.strong`
    font-size: ${({ theme }) => theme.fontSizes.xxl};

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxxl};
    `}
`;

export const FormulaFootnote = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.4;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xs};
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
