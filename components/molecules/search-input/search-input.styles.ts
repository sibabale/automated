// [ COMPONENTS > MOLECULES > SEARCH INPUT ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { motion } from 'motion/react';
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
export const SearchForm = styled.form`
    display: flex;
    width: 100%;
    min-height: ${({ theme }) => theme.size[11]};
    align-items: stretch;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.border.medium};
    background-color: ${({ theme }) => theme.background.primary};

    &:focus-within {
        border-color: ${({ theme }) => theme.border.strong};
    }

    ${media.up('md')`
        min-height: ${({ theme }: { theme: ITheme }) => theme.size[12]};
    `}
`;

export const SearchIcon = styled.span`
    display: none;
    width: ${({ theme }) => theme.size[12]};
    min-width: ${({ theme }) => theme.size[12]};
    place-items: center;
    color: ${({ theme }) => theme.text.secondary};

    svg {
        width: ${({ theme }) => theme.size[5]};
        height: ${({ theme }) => theme.size[5]};
        stroke: currentColor;
        stroke-linecap: round;
        stroke-width: 1.75;
    }

    ${media.up('md')`
        display: grid;
    `}
`;

export const SearchInputField = styled.input`
    min-width: 0;
    flex: 1;
    border: 0;
    padding: 0 ${({ theme }) => theme.spacing.s};
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};

    &::placeholder {
        color: ${({ theme }) => theme.text.tertiary};
    }
`;

export const SearchSubmitButton = styled(motion.button)`
    display: grid;
    min-width: ${({ theme }) => theme.size[12]};
    place-items: center;
    border: 0;
    background-color: ${({ theme }) => theme.background.inverse};
    color: ${({ theme }) => theme.text.inverse};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};

    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.border.strong};
        outline-offset: -4px;
    }

    ${media.up('md')`
        min-width: ${({ theme }: { theme: ITheme }) => theme.size[26]};
    `}
`;

export const SearchSubmitLabel = styled.span`
    display: none;

    ${media.up('md')`
        display: inline;
    `}
`;

export const SearchSubmitIcon = styled.span`
    font-size: ${({ theme }) => theme.fontSizes.lg};
    line-height: 1;

    ${media.up('md')`
        display: none;
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
