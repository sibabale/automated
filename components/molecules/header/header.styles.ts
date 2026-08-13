// [ COMPONENTS > MOLECULES > HEADER ] #############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';
import { motion } from 'motion/react';
import Link from 'next/link';

// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../../../theme';
import type { IThemeFontWeights, IThemeFontSizes, ITheme } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................

export const ListItemContianer = styled.ul<{ $desktopOnly?: boolean }>`
    gap: ${({ theme }) => theme.spacing.l};
    display: flex;
    padding: ${({ theme }) => theme.spacing.m};
    list-style: none;
    align-items: center;
    flex-direction: row;

    ${({ $desktopOnly }) => $desktopOnly && 'display: none;'}

    ${({ $desktopOnly }) => $desktopOnly && media.up('md')`
        display: flex;
    `}
`;

interface IListItemProps {
    color?:      keyof ITheme['text'];
    fontSize?:   keyof IThemeFontSizes;
    fontWeight?: keyof IThemeFontWeights;
    $hideOnMobile?: boolean;
    $mobileMenuItem?: boolean;
}

export const ListItem = styled.li<IListItemProps>`
    color:       ${({ theme, color = 'secondary' }) => theme.text[color]};
    font-size:   ${({ theme, fontSize   = 'sm' })      => theme.fontSizes[fontSize]};
    font-weight: ${({ theme, fontWeight = 'regular' }) => theme.fontWeights[fontWeight]};

    ${({ $hideOnMobile }) => $hideOnMobile && 'display: none;'}

    ${({ $hideOnMobile }) => $hideOnMobile && media.up('md')`
        display: list-item;
    `}

    ${({ $mobileMenuItem, theme }) => $mobileMenuItem && `
        box-sizing: border-box;
        display: flex;
        width: 100%;
        min-height: 44px;
        align-items: center;
        padding: ${theme.spacing.s} ${theme.spacing.m};
        border-radius: 4px;
        color: ${theme.text.primary};
        cursor: pointer;

        &:hover {
            background-color: ${theme.background.surface};
        }
    `}
`;

export const HeaderLink = styled(Link)`
    color: inherit;
    text-decoration: none;
`;

export const BrandLockup = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
`;

export const BrandMark = styled.span`
    display: inline-block;
    width: ${({ theme }) => theme.size[5]};
    height: ${({ theme }) => theme.size[5]};
    flex: 0 0 auto;
    background-color: ${({ theme }) => theme.text.primary};

    ${media.up('md')`
        width: ${({ theme }: { theme: ITheme }) => theme.size[5]};
        height: ${({ theme }: { theme: ITheme }) => theme.size[5]};
    `}
`;

export const HeaderContainer = styled.header`
    width: 100%;
    min-height: ${({ theme }) => `calc(${theme.size[20]} - ${theme.spacing.xs})`};
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        padding: 0 ${({ theme }: { theme: ITheme }) => `max(${theme.spacing.xl}, calc((100% - (${theme.size[160]} + ${theme.size[160]})) / 2))`};

        ${ListItemContianer} {
            padding: 0;
        }
    `}
`;

export const MobileMenuButton = styled.button`
    display: flex;
    margin-left: auto;
    padding: ${({ theme }) => theme.spacing.xs};
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: ${({ theme }) => theme.text.primary};
    cursor: pointer;
    line-height: 0;

    &:hover {
        background-color: ${({ theme }) => theme.background.surface};
    }

    ${media.up('md')`
        display: none;
    `}
`;

export const ThemeModeControl = styled.div`
    display: flex;
    align-items: center;
    margin-left: ${({ theme }) => theme.spacing.s};
    border: 1px solid ${({ theme }) => theme.border.default};
`;

export const ThemeModeButton = styled.button<{ $isActive: boolean }>`
    display: grid;
    width: ${({ theme }) => theme.size[11]};
    height: ${({ theme }) => theme.size[11]};
    place-items: center;
    border: 0;
    background-color: ${({ theme, $isActive }) => (
        $isActive ? theme.background.inverse : 'transparent'
    )};
    color: ${({ theme, $isActive }) => (
        $isActive ? theme.text.inverse : theme.text.secondary
    )};
    cursor: pointer;

    & + & {
        border-left: 1px solid ${({ theme }) => theme.border.default};
    }

    &:hover {
        color: ${({ theme, $isActive }) => (
            $isActive ? theme.text.inverse : theme.text.primary
        )};
        background-color: ${({ theme, $isActive }) => (
            $isActive ? theme.background.inverse : theme.background.surface
        )};
    }

    &:focus-visible {
        position: relative;
        outline: 2px solid ${({ theme }) => theme.border.strong};
        outline-offset: -2px;
    }

    svg {
        width: ${({ theme }) => theme.size[5]};
        height: ${({ theme }) => theme.size[5]};
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 1.75;
    }
`;

export const MobileNavigation = styled(motion.ul)`
    display: flex;
    box-sizing: border-box;
    width: 100%;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.ss};
    margin: 0;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.m};
    list-style: none;
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        display: none;
    `}
`;

export const MobileMenuItem = styled(motion.li)`
    box-sizing: border-box;
    display: flex;
    width: 100%;
    min-height: 44px;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
    border-radius: 4px;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    cursor: pointer;

    &:hover {
        background-color: ${({ theme }) => theme.background.surface};
    }
`;

// 1.6. END ........................................................................................

// END FILE ########################################################################################
