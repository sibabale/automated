'use client';

import { use, useEffect } from 'react';
import Header from '../../../components/molecules/header/header';
import { getFinancialMetric } from '../../../data/financial-metrics';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchProfitMargin } from '../../../redux/slices/profit-margin.slice';
import type { IFinancialMetricHorizon } from '../../../data/financial-metrics';
import { fetchDebtToEquity } from '../../../redux/slices/debt-to-equity.slice';
import { fetchFreeCashFlow } from '../../../redux/slices/free-cash-flow.slice';
import HorizonCard from '../../../components/molecules/horizon-card/horizon-card';
import { fetchReturnOnEquity } from '../../../redux/slices/return-on-equity.slice';
import FormulaSection from '../../../components/organisms/formula-section/formula-section';
import HorizonCardEmpty from '../../../components/molecules/horizon-card/horizon-card.empty';
import HorizonCardError from '../../../components/molecules/horizon-card/horizon-card.error';
import HorizonCardLoading from '../../../components/molecules/horizon-card/horizon-card.loading';
import DetailLeadSection from '../../../components/organisms/detail-lead-section/detail-lead-section';
import EducationalSection from '../../../components/organisms/educational-section/educational-section';
import FormulaSectionLoading from '../../../components/organisms/formula-section/formula-section.loading';
import BreadcrumbContainer from '../../../components/molecules/breadcrumb-container/breadcrumb-container';
import ConsolidationSummary from '../../../components/organisms/consolidation-summary/consolidation-summary';
import ConsolidationSummaryLoading from '../../../components/organisms/consolidation-summary/consolidation-summary.loading';
import {
    selectDebtToEquityConsolidatedSummary,
    selectDebtToEquityError,
    selectDebtToEquityHorizons,
    selectDebtToEquityIsEmpty,
    selectDebtToEquityStatus,
    selectDebtToEquityTrailingTwelveMonthsActuals,
} from '../../../redux/selectors/debt-to-equity.selectors';
import {
    selectFreeCashFlowConsolidatedSummary,
    selectFreeCashFlowError,
    selectFreeCashFlowHorizons,
    selectFreeCashFlowIsEmpty,
    selectFreeCashFlowStatus,
    selectFreeCashFlowTrailingTwelveMonthsActuals,
} from '../../../redux/selectors/free-cash-flow.selectors';
import {
    selectProfitMarginConsolidatedSummary,
    selectProfitMarginError,
    selectProfitMarginHorizons,
    selectProfitMarginIsEmpty,
    selectProfitMarginStatus,
    selectProfitMarginTrailingTwelveMonthsActuals,
} from '../../../redux/selectors/profit-margin.selectors';
import {
    selectReturnOnEquityError,
    selectReturnOnEquityHorizons,
    selectReturnOnEquityIsEmpty,
    selectReturnOnEquityStatus,
    selectConsolidatedSummary,
    selectTrailingTwelveMonthsActuals,
} from '../../../redux/selectors/return-on-equity.selectors';
import {
    DetailContentFlow,
    DesktopBreadcrumb,
    DetailPageMain,
    HorizonAnalysisGrid,
    HorizonAnalysisSection,
    HorizonAnalysisTitle,
} from './page.styles';

interface IMetricDetailsPage {
    params: Promise<{ metric: string }>;
}

type LiveMetricView = {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    horizons: Array<{
        label: string;
        range: string;
        value: string;
        breakdown: Array<{ period: string; value: string; }>;
        trend: 'up' | 'down';
    }>;
    isEmpty: boolean;
    error: { message: string; } | null;
    consolidatedSummary: {
        values: string[];
        denominator: string;
        result: string;
    } | null;
    trailingTwelveMonthsActuals: unknown;
};

type MetricLiveConfig = {
    kind: 'return-on-equity' | 'free-cash-flow' | 'debt-to-equity' | 'profit-margin';
    insights: Record<'up' | 'down', string>;
    emptyStateTitle?: string;
};

type MetricHorizonView = LiveMetricView['horizons'][number] | IFinancialMetricHorizon;

const liveMetricConfig: Record<string, MetricLiveConfig> = {
    'return-on-equity': {
        kind: 'return-on-equity',
        insights: {
            up: 'Improving returns across this period.',
            down: 'Softening returns across this period.',
        },
    },
    'free-cash-flow': {
        kind: 'free-cash-flow',
        insights: {
            up: 'Cash generation improved across this period.',
            down: 'Cash generation softened across this period.',
        },
        emptyStateTitle: 'No free cash flow to show',
    },
    'debt-to-equity': {
        kind: 'debt-to-equity',
        insights: {
            up: 'Leverage increased across this period.',
            down: 'Leverage eased across this period.',
        },
        emptyStateTitle: 'No debt-to-equity ratio to show',
    },
    'profit-margin': {
        kind: 'profit-margin',
        insights: {
            up: 'Profitability improved across this period.',
            down: 'Profitability softened across this period.',
        },
        emptyStateTitle: 'No profit margin to show',
    },
};

export default function MetricDetailsPage({
    params,
}: IMetricDetailsPage) {
    const { metric: metricSlug } = use(params);
    const metric = getFinancialMetric(metricSlug);
    const liveConfig = liveMetricConfig[metricSlug];
    const liveTicker = metric?.liveTicker ?? 'AAPL';
    const liveCompanyName = metric?.liveCompanyName ?? 'Apple Inc.';

    const dispatch = useAppDispatch();
    const returnOnEquityStatus = useAppSelector(selectReturnOnEquityStatus);
    const returnOnEquityHorizons = useAppSelector(selectReturnOnEquityHorizons);
    const returnOnEquityIsEmptyState = useAppSelector(selectReturnOnEquityIsEmpty);
    const returnOnEquityErrorState = useAppSelector(selectReturnOnEquityError);
    const returnOnEquityConsolidated = useAppSelector(selectConsolidatedSummary);
    const returnOnEquityActuals = useAppSelector(selectTrailingTwelveMonthsActuals);
    const debtToEquityStatus = useAppSelector(selectDebtToEquityStatus);
    const debtToEquityHorizons = useAppSelector(selectDebtToEquityHorizons);
    const debtToEquityIsEmptyState = useAppSelector(selectDebtToEquityIsEmpty);
    const debtToEquityErrorState = useAppSelector(selectDebtToEquityError);
    const debtToEquityConsolidated = useAppSelector(selectDebtToEquityConsolidatedSummary);
    const debtToEquityActuals = useAppSelector(selectDebtToEquityTrailingTwelveMonthsActuals);
    const freeCashFlowStatus = useAppSelector(selectFreeCashFlowStatus);
    const freeCashFlowHorizons = useAppSelector(selectFreeCashFlowHorizons);
    const freeCashFlowIsEmptyState = useAppSelector(selectFreeCashFlowIsEmpty);
    const freeCashFlowErrorState = useAppSelector(selectFreeCashFlowError);
    const freeCashFlowConsolidated = useAppSelector(selectFreeCashFlowConsolidatedSummary);
    const freeCashFlowActuals = useAppSelector(selectFreeCashFlowTrailingTwelveMonthsActuals);
    const profitMarginStatus = useAppSelector(selectProfitMarginStatus);
    const profitMarginHorizons = useAppSelector(selectProfitMarginHorizons);
    const profitMarginIsEmptyState = useAppSelector(selectProfitMarginIsEmpty);
    const profitMarginErrorState = useAppSelector(selectProfitMarginError);
    const profitMarginConsolidated = useAppSelector(selectProfitMarginConsolidatedSummary);
    const profitMarginActuals = useAppSelector(selectProfitMarginTrailingTwelveMonthsActuals);

    const liveViewByMetric: Record<string, LiveMetricView> = {
        'return-on-equity': {
            status: returnOnEquityStatus,
            horizons: returnOnEquityHorizons,
            isEmpty: returnOnEquityIsEmptyState,
            error: returnOnEquityErrorState,
            consolidatedSummary: returnOnEquityConsolidated,
            trailingTwelveMonthsActuals: returnOnEquityActuals,
        },
        'debt-to-equity': {
            status: debtToEquityStatus,
            horizons: debtToEquityHorizons,
            isEmpty: debtToEquityIsEmptyState,
            error: debtToEquityErrorState,
            consolidatedSummary: debtToEquityConsolidated,
            trailingTwelveMonthsActuals: debtToEquityActuals,
        },
        'free-cash-flow': {
            status: freeCashFlowStatus,
            horizons: freeCashFlowHorizons,
            isEmpty: freeCashFlowIsEmptyState,
            error: freeCashFlowErrorState,
            consolidatedSummary: freeCashFlowConsolidated,
            trailingTwelveMonthsActuals: freeCashFlowActuals,
        },
        'profit-margin': {
            status: profitMarginStatus,
            horizons: profitMarginHorizons,
            isEmpty: profitMarginIsEmptyState,
            error: profitMarginErrorState,
            consolidatedSummary: profitMarginConsolidated,
            trailingTwelveMonthsActuals: profitMarginActuals,
        },
    };

    const liveView = liveConfig ? liveViewByMetric[metricSlug] ?? null : null;
    const horizonStatus = liveView?.status ?? 'succeeded';
    const horizons = liveView?.horizons ?? metric?.horizons ?? [];
    const horizonsAreEmpty = liveView?.isEmpty ?? false;
    const horizonError = liveView?.error ?? null;
    const consolidatedData = liveView?.consolidatedSummary ?? metric?.consolidation ?? null;
    const isHeadlineLoading = liveConfig
        ? horizonStatus === 'idle' || horizonStatus === 'loading'
        : false;
    const currentMetricValue = consolidatedData?.result ?? metric?.value ?? '—';
    const formula = metric?.formula;
    const formulaActuals = (() => {
        if (!formula || !liveConfig) {
            return formula
                ? {
                    numeratorValue: formula.numeratorValue,
                    denominatorValue: formula.denominatorValue,
                }
                : null;
        }

        if (liveConfig.kind === 'return-on-equity') {
            return {
                numeratorValue: returnOnEquityActuals?.netIncome ?? formula.numeratorValue,
                denominatorValue: returnOnEquityActuals?.shareholdersEquity ?? formula.denominatorValue,
            };
        }

        if (liveConfig.kind === 'debt-to-equity') {
            return {
                numeratorValue: debtToEquityActuals?.totalDebt ?? formula.numeratorValue,
                denominatorValue: debtToEquityActuals?.shareholdersEquity ?? formula.denominatorValue,
            };
        }

        if (liveConfig.kind === 'profit-margin') {
            return {
                numeratorValue: profitMarginActuals?.netIncome ?? formula.numeratorValue,
                denominatorValue: profitMarginActuals?.revenue ?? formula.denominatorValue,
            };
        }

        return {
            numeratorValue: freeCashFlowActuals?.operatingCashFlow ?? formula.numeratorValue,
            denominatorValue: freeCashFlowActuals?.capitalExpenditure ?? formula.denominatorValue,
        };
    })();

    useEffect(() => {
        if (!liveConfig) {
            return;
        }

        if (liveConfig.kind === 'return-on-equity') {
            dispatch(fetchReturnOnEquity(liveTicker));
            return;
        }

        if (liveConfig.kind === 'debt-to-equity') {
            dispatch(fetchDebtToEquity(liveTicker));
            return;
        }

        if (liveConfig.kind === 'profit-margin') {
            dispatch(fetchProfitMargin(liveTicker));
            return;
        }

        dispatch(fetchFreeCashFlow(liveTicker));
    }, [dispatch, liveConfig, liveTicker]);

    const loadHorizons = () => {
        if (!liveConfig) {
            return;
        }

        if (liveConfig.kind === 'return-on-equity') {
            dispatch(fetchReturnOnEquity(liveTicker));
            return;
        }

        if (liveConfig.kind === 'debt-to-equity') {
            dispatch(fetchDebtToEquity(liveTicker));
            return;
        }

        if (liveConfig.kind === 'profit-margin') {
            dispatch(fetchProfitMargin(liveTicker));
            return;
        }

        dispatch(fetchFreeCashFlow(liveTicker));
    };

    const insightForHorizon = (horizon: MetricHorizonView): string => {
        if (liveConfig) {
            // Live metric responses only return the trend direction, so the page keeps
            // the user-facing insight copy in the metric config and derives it here.
            return liveConfig.insights[horizon.trend];
        }

        return 'insight' in horizon ? horizon.insight : '';
    };

    return (
        <div>
            <Header />
            <DesktopBreadcrumb>
                <BreadcrumbContainer
                    companyName={liveCompanyName}
                    currentLabel={metric?.label ?? 'Metric details'}
                    ticker={liveTicker}
                />
            </DesktopBreadcrumb>
            <DetailPageMain>
                <DetailLeadSection
                    companyName={liveCompanyName}
                    ticker={liveTicker}
                    title={metric?.label ?? 'Metric details'}
                    value={currentMetricValue}
                    description={metric?.description ?? 'Metric information is unavailable.'}
                    isValueLoading={isHeadlineLoading}
                />
                <DetailContentFlow>
                    {formula && (
                        horizonStatus === 'loading' ? (
                            <FormulaSectionLoading label="Loading trailing twelve months data" />
                        ) : (
                            <FormulaSection
                                {...formula}
                                numeratorValue={formulaActuals?.numeratorValue ?? formula.numeratorValue}
                                denominatorValue={formulaActuals?.denominatorValue ?? formula.denominatorValue}
                            />
                        )
                    )}
                    {metric?.education && <EducationalSection {...metric.education} />}
                    {metric?.horizons && (
                        <HorizonAnalysisSection>
                            <HorizonAnalysisTitle>Time Horizon Analysis</HorizonAnalysisTitle>
                            {horizonError ? (
                                <HorizonCardError message={horizonError.message} onRetry={loadHorizons} />
                            ) : horizonsAreEmpty ? (
                                <HorizonCardEmpty title={liveConfig?.emptyStateTitle} />
                            ) : horizonStatus === 'succeeded' ? (
                                <HorizonAnalysisGrid>
                                    {horizons.map((horizon) => (
                                        <HorizonCard
                                            key={horizon.label}
                                            label={horizon.label}
                                            range={horizon.range}
                                            value={horizon.value}
                                            breakdown={horizon.breakdown}
                                            insight={insightForHorizon(horizon)}
                                            trend={horizon.trend}
                                        />
                                    ))}
                                </HorizonAnalysisGrid>
                            ) : (
                                <HorizonAnalysisGrid>
                                    {metric.horizons.map((horizon) => (
                                        <HorizonCardLoading
                                            key={horizon.label}
                                            loaderKey={`horizon-card-loading-${horizon.label}`}
                                            mobileInsightLines={horizon.insight.length > 50 ? 2 : 1}
                                        />
                                    ))}
                                </HorizonAnalysisGrid>
                            )}
                        </HorizonAnalysisSection>
                    )}
                     {metric?.consolidation && (
                        isHeadlineLoading || !consolidatedData ? (
                            <ConsolidationSummaryLoading />
                        ) : (
                            <ConsolidationSummary
                                title={metric.consolidation.title}
                                values={consolidatedData.values}
                                denominator={consolidatedData.denominator}
                                result={consolidatedData.result}
                                note={metric.consolidation.note}
                                mobileResult={metric.consolidation.mobileResult ?? consolidatedData.result}
                                mobileNote={metric.consolidation.mobileNote}
                            />
                        )
                    )}
                </DetailContentFlow>
            </DetailPageMain>
        </div>
    );
}
