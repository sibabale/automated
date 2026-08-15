'use client';

import { use, useEffect } from 'react';
import Header from '../../../components/molecules/header/header';
import { getFinancialMetric } from '../../../data/financial-metrics';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
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

export default function MetricDetailsPage({
    params,
}: IMetricDetailsPage) {
    const { metric: metricSlug } = use(params);
    const metric = getFinancialMetric(metricSlug);

    const dispatch = useAppDispatch();
    const horizonStatus = useAppSelector(selectReturnOnEquityStatus);
    const horizons = useAppSelector(selectReturnOnEquityHorizons);
    const horizonsAreEmpty = useAppSelector(selectReturnOnEquityIsEmpty);
    const horizonError = useAppSelector(selectReturnOnEquityError);
    const consolidatedData = useAppSelector(selectConsolidatedSummary);
    const ttmActuals = useAppSelector(selectTrailingTwelveMonthsActuals);

    useEffect(() => {
        dispatch(fetchReturnOnEquity('RDDT'));
    }, [dispatch]);

    const loadHorizons = () => {
        dispatch(fetchReturnOnEquity('RDDT'));
    };

    const insightForTrend = (trend: 'up' | 'down') =>
        trend === 'up'
            ? 'Improving returns across this period.'
            : 'Softening returns across this period.';

    const isHeadlineLoading = horizonStatus === 'idle' || horizonStatus === 'loading';
    const currentReturnOnEquity = consolidatedData?.result ?? '—';

    return (
        <div>
            <Header />
            <DesktopBreadcrumb>
                <BreadcrumbContainer
                    companyName="Apple Inc."
                    currentLabel={metric?.label ?? 'Metric details'}
                    ticker="AAPL"
                />
            </DesktopBreadcrumb>
            <DetailPageMain>
                <DetailLeadSection
                    companyName="Apple Inc."
                    ticker="AAPL"
                    title={metric?.label ?? 'Metric details'}
                    value={currentReturnOnEquity}
                    description={metric?.description ?? 'Metric information is unavailable.'}
                    isValueLoading={isHeadlineLoading}
                />
                <DetailContentFlow>
                    {metric?.formula && (
                        horizonStatus === 'loading' ? (
                            <FormulaSectionLoading label="Loading trailing twelve months data" />
                        ) : (
                            <FormulaSection
                                {...metric.formula}
                                numeratorValue={ttmActuals?.netIncome ?? metric.formula.numeratorValue}
                                denominatorValue={
                                    ttmActuals?.shareholdersEquity ?? metric.formula.denominatorValue
                                }
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
                                <HorizonCardEmpty />
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
                                mobileResult={consolidatedData.result}
                                mobileNote={metric.consolidation.mobileNote}
                            />
                        )
                    )}
                </DetailContentFlow>
            </DetailPageMain>
        </div>
    );
}
