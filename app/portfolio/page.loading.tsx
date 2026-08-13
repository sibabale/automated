// [ APP > PORTFOLIO PAGE LOADING ] ##################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import PortfolioHoldingsTableHeader from '../../components/molecules/portfolio-holdings-table-header/portfolio-holdings-table-header';
import PortfolioHoldingsTableRowLoading from '../../components/molecules/portfolio-holdings-table-row/portfolio-holdings-table-row.loading';
import PortfolioSummaryCardLoading from '../../components/molecules/portfolio-summary-card/portfolio-summary-card.loading';
import { MAX_PORTFOLIO_HOLDINGS_PER_PAGE, portfolioHoldings } from '../../data/portfolio';
import {
    PortfolioHoldingCard,
    PortfolioHoldingCardLoadingContent,
    PortfolioHoldingCards,
    PortfolioHoldings,
    PortfolioHoldingsTable,
    PortfolioHoldingsTableBody,
    PortfolioMobileMetrics,
    PortfolioSectionTitle,
} from './page.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
const loadingHoldings = portfolioHoldings
    .slice(0, MAX_PORTFOLIO_HOLDINGS_PER_PAGE)
    .map((_, index) => index);
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IPortfolioPageLoading {
    label?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const PortfolioPageLoading: React.FC<IPortfolioPageLoading> = ({
    label = 'Loading portfolio data',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <>
            <PortfolioMobileMetrics>
                <PortfolioSummaryCardLoading height={86} label={label} loaderKey="portfolio-mobile-summary-loading" />
            </PortfolioMobileMetrics>
            <section aria-label="Portfolio metrics" data-testid="portfolio-metrics-loading" role="status">
                <PortfolioSummaryCardLoading height={98} label={label} loaderKey="portfolio-total-value-loading" />
                <PortfolioSummaryCardLoading height={98} label={label} loaderKey="portfolio-total-invested-loading" />
                <PortfolioSummaryCardLoading height={98} label={label} loaderKey="portfolio-total-gain-loss-loading" />
                <PortfolioSummaryCardLoading height={98} label={label} loaderKey="portfolio-average-score-loading" />
            </section>
            <PortfolioHoldings data-testid="portfolio-holdings-loading" role="status">
                <PortfolioSectionTitle>Holdings</PortfolioSectionTitle>
                <PortfolioHoldingsTable>
                    <thead>
                        <PortfolioHoldingsTableHeader />
                    </thead>
                    <PortfolioHoldingsTableBody>
                        {loadingHoldings.map((index) => (
                            <PortfolioHoldingsTableRowLoading index={index} key={index} label={label} />
                        ))}
                    </PortfolioHoldingsTableBody>
                </PortfolioHoldingsTable>
                <PortfolioHoldingCards>
                    {loadingHoldings.map((index) => (
                        <PortfolioHoldingCard key={index}>
                            <PortfolioHoldingCardLoadingContent>
                                <ContentLoader
                                    aria-label={index === 0 ? label : undefined}
                                    aria-hidden={index !== 0}
                                    backgroundColor={theme.background.loader}
                                    foregroundColor={theme.border.subtle}
                                    height={156}
                                    preserveAspectRatio="none"
                                    title={index === 0 ? label : ''}
                                    uniqueKey={`portfolio-holding-card-loading-${index}`}
                                    viewBox="0 0 320 156"
                                    width="100%"
                                >
                                    <rect height="16" rx="2" width="46%" x="0" y="0" />
                                    <rect height="22" rx="11" width="20%" x="80%" y="0" />
                                    <rect height="1" rx="0" width="100%" x="0" y="34" />
                                    <rect height="12" rx="2" width="20%" x="0" y="48" />
                                    <rect height="16" rx="2" width="26%" x="0" y="70" />
                                    <rect height="12" rx="2" width="20%" x="37%" y="48" />
                                    <rect height="16" rx="2" width="26%" x="37%" y="70" />
                                    <rect height="12" rx="2" width="20%" x="74%" y="48" />
                                    <rect height="16" rx="2" width="26%" x="74%" y="70" />
                                    <rect height="1" rx="0" width="100%" x="0" y="98" />
                                    <rect height="12" rx="2" width="20%" x="0" y="112" />
                                    <rect height="16" rx="2" width="32%" x="0" y="128" />
                                    <rect height="12" rx="2" width="20%" x="55%" y="112" />
                                    <rect height="16" rx="2" width="36%" x="55%" y="128" />
                                </ContentLoader>
                            </PortfolioHoldingCardLoadingContent>
                        </PortfolioHoldingCard>
                    ))}
                </PortfolioHoldingCards>
            </PortfolioHoldings>
        </>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default PortfolioPageLoading;

// END FILE ########################################################################################
