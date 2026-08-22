// [ COMPONENTS > MOLECULES > RUNS PAGINATION ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { pressableBounce } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. STYLES .......................................................................................
export const RunsPaginationContainer = styled.nav`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.s};
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const RunsPaginationControls = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.ss};
`;

export const RunsPaginationControl = styled.button`
    ${pressableBounce}
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
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
