// [ COMPONENTS > MOLECULES > COUNTER ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';

// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................

// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................

export const ComponentStateContainer = styled.section`
    display: grid;
    justify-items: center;
    gap: ${({ theme }) => theme.spacing.s};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.surface};
    color: ${({ theme }) => theme.text.secondary};
    text-align: center;
`;

export const ComponentStateTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
`;

export const ComponentStateMessage = styled.p`
    margin: 0;
    font-family: var(--font-geist-sans), sans-serif;
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const ComponentStateAction = styled.button`
    border: 1px solid ${({ theme }) => theme.border.strong};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.primary};
    cursor: pointer;
    font: inherit;
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.s}`};
`;

// 1.6. END ........................................................................................

// END FILE ########################################################################################
