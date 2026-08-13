'use client';

import { use } from 'react';
import Header from '../../../components/molecules/header/header';
import BreadcrumbContainer from '../../../components/molecules/breadcrumb-container/breadcrumb-container';
import DetailLeadSection from '../../../components/organisms/detail-lead-section/detail-lead-section';
import FormulaSection from '../../../components/organisms/formula-section/formula-section';
import ConsolidationSummary from '../../../components/organisms/consolidation-summary/consolidation-summary';
import EducationalSection from '../../../components/organisms/educational-section/educational-section';
import HorizonCard from '../../../components/molecules/horizon-card/horizon-card';
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

    return (
        <div>
            <Header />
            <DetailPageMain className="bg-white">
                <BreadcrumbContainer
                    companyName="Apple Inc."
                    ticker="AAPL"
                    currentLabel={metric?.label ?? 'Metric details'}
                />
                <DetailLeadSection
                    companyName="Apple Inc."
                    ticker="AAPL"
                    title={metric?.label ?? 'Metric details'}
                    value={metric?.value ?? '—'}
                    description={metric?.description ?? 'Metric information is unavailable.'}
                />
                <DetailContentFlow>
                    {metric?.formula && <FormulaSection {...metric.formula} />}
                    {metric?.education && <EducationalSection {...metric.education} />}
                    {metric?.horizons && (
                        <HorizonAnalysisSection>
                            <HorizonAnalysisTitle>Time Horizon Analysis</HorizonAnalysisTitle>
                            <HorizonAnalysisGrid>
                                {metric.horizons.map((horizon) => (
                                    <HorizonCard key={horizon.label} {...horizon} />
                                ))}
                            </HorizonAnalysisGrid>
                        </HorizonAnalysisSection>
                    )}
                    {metric?.consolidation && <ConsolidationSummary {...metric.consolidation} />}
                </DetailContentFlow>
            </DetailPageMain>
        </div>
    );
}
