// [ COMPONENTS > MOLECULES > BREADCRUMB CONTAINER ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import Link from 'next/link';
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
export const BreadcrumbContainer = styled.nav`
    display: flex;
    min-height: ${({ theme }) => theme.size[12]};
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.m};
    padding: 0 ${({ theme }) => theme.spacing.m};
    background-color: ${({ theme }) => theme.background.surface};
    overflow-x: auto;

    ${media.up('md')`
        padding: 0 ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.m}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};
    `}
`;

export const BreadcrumbTrail = styled.ol`
    display: flex;
    min-width: max-content;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    list-style: none;
`;

export const BreadcrumbLink = styled(Link)`
    color: inherit;
    text-decoration: none;

    &:hover {
        color: ${({ theme }) => theme.text.primary};
    }
`;

export const BreadcrumbSeparator = styled.span`
    color: ${({ theme }) => theme.border.medium};
`;

export const BreadcrumbCurrent = styled.span`
    color: ${({ theme }) => theme.text.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

export const BreadcrumbSource = styled.span`
    min-width: max-content;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};

    ${media.down('md')`
        display: none;
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
