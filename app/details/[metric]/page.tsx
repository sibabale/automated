'use client';

import { use, useEffect, useState } from 'react';
import Header from '../../../components/molecules/header/header';
import DetailLeadSection from '../../../components/organisms/detail-lead-section/detail-lead-section';
import FormulaSection from '../../../components/organisms/formula-section/formula-section';
import FormulaSectionLoading from '../../../components/organisms/formula-section/formula-section.loading';
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
    const [isFormulaLoading, setIsFormulaLoading] = useState(true);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setIsFormulaLoading(false);
        }, 5_000);

        return () => window.clearTimeout(timeout);
    }, [metricSlug]);

    return (
        <div>
            <Header />
            <DetailPageMain>
                <DetailLeadSection
                    companyName="Apple Inc."
                    ticker="AAPL"
                    title={metric?.label ?? 'Metric details'}
                    value={metric?.value ?? '—'}
                    description={metric?.description ?? 'Metric information is unavailable.'}
                />
                <DetailContentFlow>
                    {metric?.formula && (
                        isFormulaLoading
                            ? <FormulaSectionLoading />
                            : <FormulaSection {...metric.formula} />
                    )}
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
