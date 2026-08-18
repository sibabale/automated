// [ APP > HOME PAGE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../theme';
import type { ITheme } from '../theme';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. FUNCTIONS ....................................................................................
// 1.5. END ..........................................................................................

// 1.6. STYLES .......................................................................................
export const PageShell = styled.div`
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    background-color: ${({ theme }) => theme.background.primary};
`;

export const MainContent = styled.main`
    width: 100%;
    flex: 1;
    padding: 0 ${({ theme }) => theme.spacing.m} ${({ theme }) => theme.spacing.xxl};

    ${media.up('md')`
        padding-right: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
        padding-left: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
    `}
`;

export const HeroLayout = styled.div`
    width: 100%;
    max-width: ${({ theme }) => theme.size[160]};
    margin: ${({ theme }) => theme.spacing.xl} auto;

    ${media.up('md')`
        margin-top: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
        margin-bottom: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
    `}
`;

export const AnalysisPanel = styled.section`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xl};
    margin: 0 auto;

    ${media.up('md')`
        max-width: ${({ theme }: { theme: ITheme }) => `calc(${theme.size[160]} + ${theme.size[160]})`};
        gap: 0;
        padding: ${({ theme }: { theme: ITheme }) => `calc(${theme.spacing.xl} + ${theme.spacing.xs})`};
        border: 1px solid ${({ theme }: { theme: ITheme }) => theme.border.strong};

        [data-testid='qualitative-pillars'] {
            order: 3;
        }

        [data-testid='verdict-section'] {
            order: 4;
        }
    `}
`;

export const ReportContext = styled.div`
    display: flex;
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.border.strong};

    ${media.up('md')`
        display: contents;
        padding: 0;
        border: 0;
    `}
`;

export const BuyTradeModalBackdrop = styled.div`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.m};
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.84) 0%,
        rgba(0, 0, 0, 0.78) 100%
    );
    z-index: 20;
`;

export const BuyTradeModalCard = styled.section`
    width: 100%;
    max-width: ${({ theme }) => theme.size[160]};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
    `}
`;

export const BuyTradeModalHeader = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.l};
`;

export const BuyTradeModalTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;
`;

export const BuyTradeModalDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.5;
`;

export const BuyTradeForm = styled.form`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const BuyTradeFieldGroup = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
`;

export const BuyTradeFieldLabel = styled.label`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

export const BuyTradeFieldInput = styled.input`
    width: 100%;
    min-height: ${({ theme }) => theme.size[11]};
    padding: 0 ${({ theme }) => theme.spacing.s};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
`;

export const BuyTradeEstimatePanel = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.surface};
`;

export const BuyTradeEstimateLabel = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    text-transform: uppercase;
`;

export const BuyTradeEstimateValue = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;
`;

export const BuyTradeEstimateMeta = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.5;
`;

export const BuyTradeActions = styled.div`
    display: flex;
    flex-direction: column-reverse;
    gap: ${({ theme }) => theme.spacing.s};

    ${media.up('md')`
        flex-direction: row;
        justify-content: flex-end;
    `}
`;

export const BuyTradeActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    min-height: ${({ theme }) => theme.size[11]};
    padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
    border: 1px solid ${({ theme, $variant = 'secondary' }) => (
        $variant === 'primary' ? theme.border.strong : theme.border.default
    )};
    background-color: ${({ theme, $variant = 'secondary' }) => (
        $variant === 'primary' ? theme.background.inverse : theme.background.primary
    )};
    color: ${({ theme, $variant = 'secondary' }) => (
        $variant === 'primary' ? theme.text.inverse : theme.text.primary
    )};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

export const BuyTradeSuccessBanner = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.ss};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.status.positive.border};
    background-color: ${({ theme }) => theme.status.positive.background};
`;

export const BuyTradeSuccessTitle = styled.strong`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const BuyTradeSuccessDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.5;
`;

export const BuyTradeStateContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.status.error.icon};
    background-color: ${({ theme }) => theme.status.error.background};
`;

export const BuyTradeStateTitle = styled.h3`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const BuyTradeStateDescription = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.5;
`;

export const BuyTradeStateAction = styled.button`
    justify-self: start;
    min-height: ${({ theme }) => theme.size[11]};
    padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
    border: 1px solid ${({ theme }) => theme.border.strong};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.primary};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
