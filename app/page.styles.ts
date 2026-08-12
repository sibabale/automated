// [ APP > HOME PAGE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../theme';
import type { ITheme } from '../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
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

// 1.6. END ........................................................................................

// END FILE ########################################################################################
