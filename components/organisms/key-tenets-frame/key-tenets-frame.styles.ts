// [ COMPONENTS > ORGANISMS > KEY TENETS FRAME ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import styled from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
export const KeyTenetsFrameContainer = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
    padding-top: ${({ theme }) => theme.spacing.l};
`;

export const KeyTenetsHeading = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    text-transform: uppercase;
`;

export const KeyTenetsMetrics = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > :last-child {
        grid-column: 1 / -1;
        justify-items: center;
        text-align: center;
    }

    ${media.up('md')`
        grid-template-columns: repeat(5, minmax(0, 1fr));

        > :last-child {
            grid-column: auto;
            justify-items: stretch;
            text-align: left;
        }
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
