// [ COMPONENTS > MOLECULES > PORTFOLIO SUMMARY CARD LOADING ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { PortfolioSummaryCardContainer } from './portfolio-summary-card.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IPortfolioSummaryCardLoading {
    label?: string;
    loaderKey?: string;
    height?: number;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const PortfolioSummaryCardLoading: React.FC<IPortfolioSummaryCardLoading> = ({
    label = 'Loading portfolio summary',
    loaderKey = 'portfolio-summary-card-loading',
    height = 84,
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <PortfolioSummaryCardContainer data-testid="portfolio-summary-card-loading" role="status">
            <ContentLoader
                aria-label={label}
                backgroundColor={theme.background.loader}
                foregroundColor={theme.border.subtle}
                height={height}
                preserveAspectRatio="none"
                title={label}
                uniqueKey={loaderKey}
                viewBox={`0 0 320 ${height}`}
                width="100%"
            >
                <rect height="14" rx="2" width="42%" x="0" y="0" />
                <rect height="30" rx="2" width="72%" x="0" y="26" />
                <rect height="16" rx="2" width="54%" x="0" y={height - 16} />
            </ContentLoader>
        </PortfolioSummaryCardContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default PortfolioSummaryCardLoading;

// END FILE ########################################################################################
