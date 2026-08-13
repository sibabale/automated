// [ COMPONENTS > MOLECULES > PORTFOLIO HOLDINGS TABLE ROW LOADING ] ################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { PortfolioHoldingsDataCell, PortfolioHoldingsRow } from './portfolio-holdings-table-row.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
const columnWidths = ['100%', '54%', '48%', '72%', '72%', '76%', '76%', '40%'];
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IPortfolioHoldingsTableRowLoading {
    index: number;
    label?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const PortfolioHoldingsTableRowLoading: React.FC<IPortfolioHoldingsTableRowLoading> = ({
    index,
    label = 'Loading portfolio holding',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <PortfolioHoldingsRow
            aria-busy="true"
            data-testid="portfolio-holdings-table-row-loading"
        >
            {columnWidths.map((width, columnIndex) => (
                <PortfolioHoldingsDataCell
                    as={columnIndex === 0 ? 'th' : 'td'}
                    key={`${index}-${columnIndex}`}
                >
                    <ContentLoader
                        aria-hidden={columnIndex !== 0}
                        aria-label={columnIndex === 0 ? label : undefined}
                        backgroundColor={theme.background.loader}
                        foregroundColor={theme.border.subtle}
                        height={21}
                        preserveAspectRatio="none"
                        title={columnIndex === 0 ? label : ''}
                        uniqueKey={`portfolio-holdings-table-row-loading-${index}-${columnIndex}`}
                        viewBox="0 0 100 21"
                        width="100%"
                    >
                        <rect height="21" rx="2" width={width} x="0" y="0" />
                    </ContentLoader>
                </PortfolioHoldingsDataCell>
            ))}
        </PortfolioHoldingsRow>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default PortfolioHoldingsTableRowLoading;

// END FILE ########################################################################################
