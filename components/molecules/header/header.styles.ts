// [ COMPONENTS > MOLECULES > HEADER ] #############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';

// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import type { IThemeFontWeights, IThemeFontSizes } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................

export const ListItemContianer = styled.ul`
    gap: 20px;
    width: 100%;
    display: flex;
    padding: ${({ theme }) => theme.spacing.m};
    list-style: none;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    flex-direction: row;
    background-color: ${({ theme }) => theme.background.surface};
`;

interface IListItemProps {
    fontWeight?: keyof IThemeFontWeights;
    fontSize?:   keyof IThemeFontSizes;
}

export const ListItem = styled.li<IListItemProps>`
    color:       ${({ theme }) => theme.text.primary};
    font-size:   ${({ theme, fontSize   = 'sm' })      => theme.fontSizes[fontSize]};
    font-weight: ${({ theme, fontWeight = 'regular' }) => theme.fontWeights[fontWeight]};
`;

// 1.6. END ........................................................................................

// END FILE ########################################################################################
