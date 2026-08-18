// [ COMPONENTS > MOLECULES > HEADER POPOVER ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../../../theme';
import type { ITheme } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. STYLES .......................................................................................
export const HeaderPopoverTrigger = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
`;

export const HeaderPopoverButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: help;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
`;

export const HeaderPopoverIcon = styled.span`
    display: inline-grid;
    width: ${({ theme }) => theme.size[5]};
    height: ${({ theme }) => theme.size[5]};
    place-items: center;
    border: 1px solid ${({ theme }) => theme.border.subtle};
    border-radius: 999px;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;
    text-transform: none;
`;

export const HeaderPopoverSurface = styled.div`
    position: absolute;
    top: calc(100% + ${({ theme }) => theme.spacing.xs});
    left: 0;
    z-index: 5;
    width: min(240px, 70vw);
    padding: ${({ theme }) => theme.spacing.s};
    border: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);

    ${media.up('md')`
        width: ${({ theme }: { theme: ITheme }) => theme.size[26]};
    `}
`;

export const HeaderPopoverTitle = styled.strong`
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: none;
`;

export const HeaderPopoverBody = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    line-height: 1.5;
    text-transform: none;
`;
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
