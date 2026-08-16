'use client';

import { use, useEffect } from 'react';
import Header from '../../../components/molecules/header/header';
import { getFinancialMetric } from '../../../data/financial-metrics';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
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
    selectFreeCashFlowConsolidatedSummary,
    selectFreeCashFlowError,
    selectFreeCashFlowHorizons,
    selectFreeCashFlowIsEmpty,
    selectFreeCashFlowStatus,
    selectFreeCashFlowTrailingTwelveMonthsActuals,
} from '../../../redux/selectors/free-cash-flow.selectors';
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
    kind: 'return-on-equity' | 'free-cash-flow';
};

const liveMetricConfig: Record<string, MetricLiveConfig> = {
    'return-on-equity': {
        kind: 'return-on-equity',
    },
    'free-cash-flow': {
        kind: 'free-cash-flow',
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
    const freeCashFlowStatus = useAppSelector(selectFreeCashFlowStatus);
    const freeCashFlowHorizons = useAppSelector(selectFreeCashFlowHorizons);
    const freeCashFlowIsEmptyState = useAppSelector(selectFreeCashFlowIsEmpty);
    const freeCashFlowErrorState = useAppSelector(selectFreeCashFlowError);
    const freeCashFlowConsolidated = useAppSelector(selectFreeCashFlowConsolidatedSummary);
    const freeCashFlowActuals = useAppSelector(selectFreeCashFlowTrailingTwelveMonthsActuals);

    const liveViewByMetric: Record<string, LiveMetricView> = {
        'return-on-equity': {
            status: returnOnEquityStatus,
            horizons: returnOnEquityHorizons,
            isEmpty: returnOnEquityIsEmptyState,
            error: returnOnEquityErrorState,
            consolidatedSummary: returnOnEquityConsolidated,
            trailingTwelveMonthsActuals: returnOnEquityActuals,
        },
        'free-cash-flow': {
            status: freeCashFlowStatus,
            horizons: freeCashFlowHorizons,
            isEmpty: freeCashFlowIsEmptyState,
            error: freeCashFlowErrorState,
            consolidatedSummary: freeCashFlowConsolidated,
            trailingTwelveMonthsActuals: freeCashFlowActuals,
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

        dispatch(fetchFreeCashFlow(liveTicker));
    };

    const insightForTrend = (trend: 'up' | 'down') =>
        trend === 'up'
            ? 'Improving returns across this period.'
            : 'Softening returns across this period.';

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
                                <HorizonCardEmpty
                                    title={metric.label === 'Free Cash Flow' ? 'No free cash flow to show' : undefined}
                                />
                            ) : horizonStatus === 'succeeded' ? (
                                <HorizonAnalysisGrid>
                                    {horizons.map((horizon) => (
                                        <HorizonCard
                                            key={horizon.label}
                                            label={horizon.label}
                                            range={horizon.range}
                                            value={horizon.value}
                                            breakdown={horizon.breakdown}
                                            insight={insightForTrend(horizon.trend)}
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
