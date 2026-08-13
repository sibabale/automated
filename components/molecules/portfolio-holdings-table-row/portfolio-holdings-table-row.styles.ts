// [ COMPONENTS > MOLECULES > PORTFOLIO HOLDINGS TABLE ROW ] #########################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';
import { motion } from 'motion/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import type { ITheme } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
export const PortfolioHoldingsRow = styled(motion.tr)`
    th {
        padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.m} ${theme.spacing.s}`};
        border-bottom: 1px solid ${({ theme }: { theme: ITheme }) => theme.border.default};
        color: ${({ theme }: { theme: ITheme }) => theme.text.primary};
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.sm};
        font-weight: ${({ theme }: { theme: ITheme }) => theme.fontWeights.bold};
        text-align: left;
    }
`;

export const PortfolioHoldingsDataCell = styled.td`
    padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.m} ${theme.spacing.s}`};
    border-bottom: 1px solid ${({ theme }: { theme: ITheme }) => theme.border.default};
    color: ${({ theme }: { theme: ITheme }) => theme.text.primary};
    font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }: { theme: ITheme }) => theme.fontWeights.medium};
    text-align: left;
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
