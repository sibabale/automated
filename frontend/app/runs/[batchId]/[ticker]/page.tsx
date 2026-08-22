// [ APP > RUNS > DETAIL ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import Header from '../../../../components/molecules/header/header';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchRunDetail, resetRunDetail } from '../../../../redux/slices/run-detail.slice';
import {
    DetailBackLink,
    DetailCard,
    DetailCardDescription,
    DetailCardLabel,
    DetailCardValue,
    DetailContainer,
    DetailContent,
    DetailErrorContainer,
    DetailErrorMessage,
    DetailGrid,
    DetailHeader,
    DetailHeading,
    DetailSection,
    DetailSectionTitle,
    DetailStatusBadge,
    DetailStrengthBadge,
    DetailSubtitle,
} from './page.styles';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
/**
 * Formats a metric value for display. Large numbers are abbreviated with K/M/B
 * suffixes; percentages and ratios are shown with two decimal places.
 */
function formatMetricValue(label: string, value: number): string {
    if (label === 'freeCashFlow') {
        const absValue = Math.abs(value);
        if (absValue >= 1_000_000_000) {
            return `$${(value / 1_000_000_000).toFixed(2)}B`;
        }
        if (absValue >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(2)}M`;
        }
        if (absValue >= 1_000) {
            return `$${(value / 1_000).toFixed(2)}K`;
        }
        return `$${value.toFixed(2)}`;
    }
    if (label === 'marginOfSafety' || label === 'profitMargin' || label === 'returnOnEquity') {
        return `${value.toFixed(2)}%`;
    }
    return value.toFixed(2);
}

/**
 * Provides a human-readable label for metric keys.
 */
function metricDisplayName(key: string): string {
    const names: Record<string, string> = {
        debtToEquity: 'Debt to Equity',
        freeCashFlow: 'Free Cash Flow',
        marginOfSafety: 'Margin of Safety',
        profitMargin: 'Profit Margin',
        returnOnEquity: 'Return on Equity',
    };
    return names[key] ?? key;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................

/**
 * Decision detail page showing metrics, strengths, and trade execution
 * information for a single automated investment decision.
 */
const RunDetailPage: React.FC = () => {
    // 1.4.1. HOOKS & API CALLS ......................................................................
    const dispatch = useAppDispatch();
    const params = useParams<{ batchId: string; ticker: string }>();

    const { status, data, errorMessage } = useAppSelector((state) => state.runDetail);

    const batchId = params?.batchId ? decodeURIComponent(params.batchId) : '';
    const ticker = params?.ticker ? decodeURIComponent(params.ticker) : '';

    useEffect(() => {
        if (batchId && ticker) {
            dispatch(fetchRunDetail({ batchId, ticker }));
        }
        return () => {
            dispatch(resetRunDetail());
        };
    }, [dispatch, batchId, ticker]);
    // 1.4.1. END ....................................................................................

    // 1.4.2. FUNCTIONS & LOCAL VARIABLES ............................................................
    const isLoading = status === 'loading';
    const hasError = status === 'failed';
    const hasData = status === 'succeeded' && data !== null;

    /**
     * Ordered list of metrics with their formatted values and strengths for
     * consistent display across viewports.
     */
    const metricCards = useMemo(() => {
        if (!data) return [];
        const keys = ['returnOnEquity', 'freeCashFlow', 'debtToEquity', 'profitMargin', 'marginOfSafety'] as const;
        return keys.map((key) => ({
            key,
            label: metricDisplayName(key),
            value: formatMetricValue(key, data.metrics[key]),
            strength: data.strengths[key],
        }));
    }, [data]);
    // 1.4.2. END ....................................................................................

    // 1.4.3. RENDER .................................................................................

    return (
        <DetailContainer>
            <Header />
            <DetailContent>
                <DetailHeader>
                    <DetailBackLink href="/runs">← Back to Runs</DetailBackLink>
                    {isLoading && <DetailHeading>Loading...</DetailHeading>}
                    {hasError && <DetailHeading>Error</DetailHeading>}
                    {hasData && (
                        <>
                            <DetailHeading>{data.ticker}</DetailHeading>
                            <DetailSubtitle>{data.companyName ?? 'Unknown company'}</DetailSubtitle>
                        </>
                    )}
                </DetailHeader>

                {hasError && (
                    <DetailErrorContainer>
                        <DetailErrorMessage>{errorMessage}</DetailErrorMessage>
                        <DetailBackLink href="/runs">Return to Runs</DetailBackLink>
                    </DetailErrorContainer>
                )}

                {hasData && (
                    <>
                        {/* Overview section */}
                        <DetailSection>
                            <DetailSectionTitle>Overview</DetailSectionTitle>
                            <DetailGrid>
                                <DetailCard>
                                    <DetailCardLabel>Status</DetailCardLabel>
                                    <DetailCardValue>
                                        <DetailStatusBadge>{data.status}</DetailStatusBadge>
                                    </DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Batch ID</DetailCardLabel>
                                    <DetailCardValue>{data.batchId}</DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Processed At</DetailCardLabel>
                                    <DetailCardValue>
                                        {data.processedAt.replace('T', ' ').slice(0, 16)}
                                    </DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Analysis Model</DetailCardLabel>
                                    <DetailCardValue>{data.analysisModel}</DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Constitution</DetailCardLabel>
                                    <DetailCardValue>{data.constitutionVersion}</DetailCardValue>
                                </DetailCard>
                            </DetailGrid>
                        </DetailSection>

                        {/* Metrics section */}
                        <DetailSection>
                            <DetailSectionTitle>Metrics</DetailSectionTitle>
                            <DetailGrid>
                                {metricCards.map((metric) => (
                                    <DetailCard key={metric.key}>
                                        <DetailCardLabel>{metric.label}</DetailCardLabel>
                                        <DetailCardValue>{metric.value}</DetailCardValue>
                                        <DetailStrengthBadge $strength={metric.strength}>
                                            {metric.strength}
                                        </DetailStrengthBadge>
                                    </DetailCard>
                                ))}
                            </DetailGrid>
                        </DetailSection>

                        {/* Trade Execution section */}
                        <DetailSection>
                            <DetailSectionTitle>Trade Execution</DetailSectionTitle>
                            <DetailGrid>
                                <DetailCard>
                                    <DetailCardLabel>Attempted</DetailCardLabel>
                                    <DetailCardValue>
                                        {data.tradeExecution.attempted ? 'Yes' : 'No'}
                                    </DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Mode</DetailCardLabel>
                                    <DetailCardValue>{data.tradeExecution.mode}</DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Status</DetailCardLabel>
                                    <DetailCardValue>{data.tradeExecution.status}</DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Share Price</DetailCardLabel>
                                    <DetailCardValue>
                                        ${data.tradeExecution.sharePrice.toFixed(2)}
                                    </DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Quantity</DetailCardLabel>
                                    <DetailCardValue>{data.tradeExecution.quantity}</DetailCardValue>
                                </DetailCard>
                                <DetailCard>
                                    <DetailCardLabel>Max Trade Amount</DetailCardLabel>
                                    <DetailCardValue>
                                        ${data.tradeExecution.maxTradeAmount.toLocaleString()}
                                    </DetailCardValue>
                                </DetailCard>
                                {data.tradeExecution.skipReason && (
                                    <DetailCard>
                                        <DetailCardLabel>Skip Reason</DetailCardLabel>
                                        <DetailCardDescription>
                                            {data.tradeExecution.skipReason}
                                        </DetailCardDescription>
                                    </DetailCard>
                                )}
                                {data.tradeExecution.orderClientId && (
                                    <DetailCard>
                                        <DetailCardLabel>Order ID</DetailCardLabel>
                                        <DetailCardValue>
                                            {data.tradeExecution.orderClientId}
                                        </DetailCardValue>
                                    </DetailCard>
                                )}
                            </DetailGrid>
                        </DetailSection>
                    </>
                )}
            </DetailContent>
        </DetailContainer>
    );

    // 1.4.3. END ....................................................................................
};

// 1.4. END ..........................................................................................

export default RunDetailPage;

// END FILE ##########################################################################################
