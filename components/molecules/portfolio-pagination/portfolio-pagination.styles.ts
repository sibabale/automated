// [ COMPONENTS > MOLECULES > PORTFOLIO PAGINATION ] ##################################################

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
export const PortfolioPaginationContainer = styled.nav`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};

    div {
        display: flex;
        gap: ${({ theme }) => theme.spacing.ss};
    }
`;

export const PortfolioPaginationControl = styled.button`
    display: grid;
    min-width: ${({ theme }) => `calc(${theme.size[5]} + ${theme.spacing.s})`};
    min-height: ${({ theme }) => `calc(${theme.size[5]} + ${theme.spacing.s})`};
    place-items: center;
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
    color: ${({ theme }) => theme.text.secondary};
    cursor: pointer;
    font: inherit;

    &[aria-current='page'] {
        border-color: ${({ theme }) => theme.text.primary};
        background-color: ${({ theme }) => theme.text.primary};
        color: ${({ theme }) => theme.text.inverse};
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
