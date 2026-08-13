// [ APP > PORTFOLIO PAGE ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import type { Variants } from 'motion/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import Header from '../../components/molecules/header/header';
import { TrendValue } from '../../components/atoms/trend-badge/trend-badge.styles';
import PortfolioHoldingsTableHeader from '../../components/molecules/portfolio-holdings-table-header/portfolio-holdings-table-header';
import PortfolioHoldingsTableRow from '../../components/molecules/portfolio-holdings-table-row/portfolio-holdings-table-row';
import PortfolioPagination from '../../components/molecules/portfolio-pagination/portfolio-pagination';
import PortfolioSummaryCard from '../../components/molecules/portfolio-summary-card/portfolio-summary-card';
import {
    formatPortfolioCurrency,
    getPortfolioTrend,
    MAX_PORTFOLIO_HOLDINGS_PER_PAGE,
    portfolioHoldings,
    portfolioSummary,
} from '../../data/portfolio';
import {
    PortfolioContainer,
    PortfolioContent,
    PortfolioHeader,
    PortfolioHeaderContent,
    PortfolioHeading,
    PortfolioHoldingCard,
    PortfolioHoldingCards,
    PortfolioHoldingName,
    PortfolioHoldingScore,
    PortfolioHoldings,
    PortfolioHoldingsTable,
    PortfolioHoldingsTableBody,
    PortfolioMobileMetrics,
    PortfolioSectionTitle,
    PortfolioSubtitle,
} from './page.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
type IPortfolioPage = Record<never, never>;
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................
const holdingsTableBodyVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const PortfolioPage: React.FC<IPortfolioPage> = () => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const [currentPage, setCurrentPage] = useState(1);
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    const totalPages = Math.max(
        1,
        Math.ceil(portfolioHoldings.length / MAX_PORTFOLIO_HOLDINGS_PER_PAGE),
    );
    const visibleHoldings = portfolioHoldings.slice(
        (currentPage - 1) * MAX_PORTFOLIO_HOLDINGS_PER_PAGE,
        currentPage * MAX_PORTFOLIO_HOLDINGS_PER_PAGE,
    );
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <MotionConfig reducedMotion="user">
            <PortfolioContainer>
                <Header />
            <PortfolioHeader>
                <PortfolioHeaderContent>
                    <PortfolioHeading>Portfolio</PortfolioHeading>
                    <PortfolioSubtitle>Live valuations · USD</PortfolioSubtitle>
                </PortfolioHeaderContent>
            </PortfolioHeader>
            <PortfolioContent data-testid="portfolio-page">
                <PortfolioMobileMetrics>
                    <PortfolioSummaryCard label="Buffett score" value={`${portfolioSummary.averageScore}/10`} description="Portfolio average" />
                </PortfolioMobileMetrics>

                <section aria-label="Portfolio metrics">
                    <PortfolioSummaryCard label="Total value" value={formatPortfolioCurrency(portfolioSummary.totalValue)} description={`↗ +${portfolioSummary.totalGainPercentage}% YTD`} />
                    <PortfolioSummaryCard label="Total invested" value={formatPortfolioCurrency(portfolioSummary.totalInvested)} />
                    <PortfolioSummaryCard label="Total gain / loss" value={formatPortfolioCurrency(portfolioSummary.totalGainLoss)} description="↗ In profit" trend={getPortfolioTrend(portfolioSummary.totalGainLoss)} />
                    <PortfolioSummaryCard label="Average Buffett score" value={`${portfolioSummary.averageScore}/10`} />
                </section>

                <PortfolioHoldings>
                    <PortfolioSectionTitle>Holdings</PortfolioSectionTitle>
                    <PortfolioHoldingsTable>
                        <thead>
                            <PortfolioHoldingsTableHeader />
                        </thead>
                        <PortfolioHoldingsTableBody
                            animate="visible"
                            initial="hidden"
                            variants={holdingsTableBodyVariants}
                        >
                            {visibleHoldings.map((holding) => (
                                <PortfolioHoldingsTableRow key={holding.ticker} holding={holding} />
                            ))}
                        </PortfolioHoldingsTableBody>
                    </PortfolioHoldingsTable>
                    <PortfolioHoldingCards>
                        {visibleHoldings.map((holding) => (
                            <PortfolioHoldingCard key={holding.ticker}>
                                <PortfolioHoldingName>{holding.company} <span>{holding.ticker}</span></PortfolioHoldingName>
                                <PortfolioHoldingScore>Score {holding.score}</PortfolioHoldingScore>
                                <dl>
                                    <div><dt>Shares</dt><dd>{holding.shares}</dd></div><div><dt>Avg buy</dt><dd>{formatPortfolioCurrency(holding.averageBuy)}</dd></div><div><dt>Current</dt><dd>{formatPortfolioCurrency(holding.current)}</dd></div>
                                </dl>
                                <dl>
                                    <div><dt>Valuation</dt><dd>{formatPortfolioCurrency(holding.value)}</dd></div><div><dt>Gain / loss</dt><TrendValue as="dd" $variant={getPortfolioTrend(holding.gainLoss)}>{formatPortfolioCurrency(holding.gainLoss)}</TrendValue></div>
                                </dl>
                            </PortfolioHoldingCard>
                        ))}
                    </PortfolioHoldingCards>
                </PortfolioHoldings>

                <PortfolioPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                </PortfolioContent>
            </PortfolioContainer>
        </MotionConfig>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default PortfolioPage;

// END FILE ########################################################################################
