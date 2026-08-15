// [ COMPONENTS > MOLECULES > CRITERIA CARD ] ########################################################

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
export const CriteriaCardContainer = styled.article`
    display: grid;
    height: 100%;
    min-width: 0;
    align-content: start;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.l};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
`;

export const CriteriaLabel = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    line-height: 1.2;
    overflow-wrap: anywhere;
    text-transform: uppercase;
`;

export const CriteriaTitle = styled.h3`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    line-height: 1.3;
    overflow-wrap: anywhere;
`;

export const CriteriaDescription = styled.p`
    margin: ${({ theme }) => theme.spacing.xs} 0 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.45;
    overflow-wrap: anywhere;
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
