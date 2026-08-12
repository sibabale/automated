// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
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
export const QualitativePillarsContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        padding-top: ${({ theme }: { theme: ITheme }) => theme.spacing.xl};
    `}
`;

export const QualitativePillarsHeading = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const QualitativePillarsGrid = styled.div`
    display: grid;
    grid-auto-rows: 1fr;
    gap: ${({ theme }) => theme.spacing.m};
    grid-template-columns: minmax(0, 1fr);

    ${media.up('md')`
        grid-template-columns: repeat(2, minmax(0, 1fr));
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
