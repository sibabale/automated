'use client';

import { use, useEffect, useState } from 'react';
import Header from '../../../components/molecules/header/header';
import DetailLeadSection from '../../../components/organisms/detail-lead-section/detail-lead-section';
import DetailLeadSectionLoading from '../../../components/organisms/detail-lead-section/detail-lead-section.loading';
import FormulaSection from '../../../components/organisms/formula-section/formula-section';
import FormulaSectionLoading from '../../../components/organisms/formula-section/formula-section.loading';
import ConsolidationSummary from '../../../components/organisms/consolidation-summary/consolidation-summary';
import ConsolidationSummaryLoading from '../../../components/organisms/consolidation-summary/consolidation-summary.loading';
import EducationalSection from '../../../components/organisms/educational-section/educational-section';
import EducationalSectionLoading from '../../../components/organisms/educational-section/educational-section.loading';
import HorizonCard from '../../../components/molecules/horizon-card/horizon-card';
import HorizonCardLoading from '../../../components/molecules/horizon-card/horizon-card.loading';
import { getFinancialMetric } from '../../../data/financial-metrics';
import {
    DetailContentFlow,
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
    const [isContentLoading, setIsContentLoading] = useState(true);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setIsContentLoading(false);
        }, 5_000);

        return () => window.clearTimeout(timeout);
    }, [metricSlug]);

    return (
        <div>
            <Header />
            <DetailPageMain>
                {isContentLoading ? (
                    <DetailLeadSectionLoading />
                ) : (
                    <DetailLeadSection
                        companyName="Apple Inc."
                        ticker="AAPL"
                        title={metric?.label ?? 'Metric details'}
                        value={metric?.value ?? '—'}
                        description={metric?.description ?? 'Metric information is unavailable.'}
                    />
                )}
                <DetailContentFlow>
                    {metric?.formula && (
                        isContentLoading
                            ? <FormulaSectionLoading />
                            : <FormulaSection {...metric.formula} />
                    )}
                    {metric?.education && (
                        isContentLoading
                            ? <EducationalSectionLoading />
                            : <EducationalSection {...metric.education} />
                    )}
                    {metric?.horizons && (
                        <HorizonAnalysisSection>
                            <HorizonAnalysisTitle>Time Horizon Analysis</HorizonAnalysisTitle>
                            <HorizonAnalysisGrid>
                                {isContentLoading
                                    ? metric.horizons.map((horizon) => (
                                        <HorizonCardLoading
                                            key={horizon.label}
                                            loaderKey={`horizon-card-loading-${horizon.label}`}
                                            mobileInsightLines={horizon.insight.length > 50 ? 2 : 1}
                                        />
                                    ))
                                    : metric.horizons.map((horizon) => (
                                        <HorizonCard key={horizon.label} {...horizon} />
                                    ))}
                            </HorizonAnalysisGrid>
                        </HorizonAnalysisSection>
                    )}
                    {metric?.consolidation && (
                        isContentLoading
                            ? <ConsolidationSummaryLoading />
                            : <ConsolidationSummary {...metric.consolidation} />
                    )}
                </DetailContentFlow>
            </DetailPageMain>
        </div>
    );
}
