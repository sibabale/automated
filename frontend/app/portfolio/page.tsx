// [ APP > PORTFOLIO PAGE ] ##########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import { MotionConfig } from 'motion/react';
import type { Variants } from 'motion/react';
import React, { useEffect, useState } from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import PortfolioPageError from './page.error';
import PortfolioPageEmpty from './page.empty';
import PortfolioPageLoading from './page.loading';
import Header from '../../components/molecules/header/header';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { TrendValue } from '../../components/atoms/trend-badge/trend-badge.styles';
import PortfolioPagination from '../../components/molecules/portfolio-pagination/portfolio-pagination';
import PortfolioSummaryCard from '../../components/molecules/portfolio-summary-card/portfolio-summary-card';
import PortfolioHoldingsTableRow from '../../components/molecules/portfolio-holdings-table-row/portfolio-holdings-table-row';
import PortfolioHoldingsTableHeader from '../../components/molecules/portfolio-holdings-table-header/portfolio-holdings-table-header';
import {
    selectPortfolioError,
    selectPortfolioHoldings,
    selectPortfolioIsEmpty,
    selectPortfolioSummary,
    selectPortfolioStatus,
} from '../../redux/selectors/portfolio.selectors';
import {
    formatPortfolioCurrency,
    getPortfolioTrend,
    MAX_PORTFOLIO_HOLDINGS_PER_PAGE,
} from '../../data/portfolio';
import { fetchPortfolio } from '../../redux/slices/portfolio.slice';
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
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
type IPortfolioPage = Record<never, never>;
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................
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
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const portfolioStatus = useAppSelector(selectPortfolioStatus);
    const portfolioHoldings = useAppSelector(selectPortfolioHoldings);
    const portfolioSummary = useAppSelector(selectPortfolioSummary);
    const portfolioError = useAppSelector(selectPortfolioError);
    const isPortfolioEmpty = useAppSelector(selectPortfolioIsEmpty);
    const isContentLoading = portfolioStatus === 'idle' || portfolioStatus === 'loading';

    useEffect(() => {
        dispatch(fetchPortfolio('paper'));
    }, [dispatch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [portfolioHoldings.length]);
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    const totalPages = Math.max(
        1,
        Math.ceil(portfolioHoldings.length / MAX_PORTFOLIO_HOLDINGS_PER_PAGE),
    );
    const summary = portfolioSummary ?? {
        totalValue: '$0.00',
        totalInvested: '$0.00',
        totalGainLoss: '$0.00',
        totalGainPercentage: null,
        averageScore: null,
    };
    const visibleHoldings = portfolioHoldings.slice(
        (currentPage - 1) * MAX_PORTFOLIO_HOLDINGS_PER_PAGE,
        currentPage * MAX_PORTFOLIO_HOLDINGS_PER_PAGE,
    );
    const reloadPortfolio = () => {
        dispatch(fetchPortfolio('paper'));
    };
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
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
                    {isContentLoading ? (
                        <PortfolioPageLoading />
                    ) : portfolioError ? (
                        <PortfolioPageError message={portfolioError.message} onRetry={reloadPortfolio} />
                    ) : isPortfolioEmpty ? (
                        <PortfolioPageEmpty
                            actionLabel="Reload portfolio"
                            message="No paper holdings are available yet. Place a trade, then reload the portfolio."
                            onAction={reloadPortfolio}
                        />
                    ) : (
                        <>
                            <PortfolioMobileMetrics>
                                <PortfolioSummaryCard
                                    description="Portfolio average"
                                    label="Buffett score"
                                    value={summary.averageScore ? `${summary.averageScore}/10` : '—'}
                                />
                            </PortfolioMobileMetrics>

                            <section aria-label="Portfolio metrics">
                                <PortfolioSummaryCard
                                    description={summary.totalGainPercentage ? `↗ ${summary.totalGainPercentage} total return` : 'Portfolio market value'}
                                    label="Current Market Value"
                                    value={formatPortfolioCurrency(summary.totalValue)}
                                />
                                <PortfolioSummaryCard
                                    label="Value at Purchase"
                                    value={formatPortfolioCurrency(summary.totalInvested)}
                                />
                                <PortfolioSummaryCard
                                    description={summary.totalGainLoss.startsWith('−') ? '↘ Currently down' : '↗ In profit'}
                                    label="Total gain / loss"
                                    trend={getPortfolioTrend(summary.totalGainLoss)}
                                    value={formatPortfolioCurrency(summary.totalGainLoss)}
                                />
                                <PortfolioSummaryCard
                                    label="Average Buffett score"
                                    value={summary.averageScore ? `${summary.averageScore}/10` : '—'}
                                />
                            </section>

                            <PortfolioHoldings data-testid="portfolio-holdings">
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
                        </>
                    )}
                    {!isContentLoading && !portfolioError && !isPortfolioEmpty && (
                        <PortfolioPagination
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            totalPages={totalPages}
                        />
                    )}
                </PortfolioContent>
            </PortfolioContainer>
        </MotionConfig>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default PortfolioPage;

// END FILE ##########################################################################################
