// [ COMPONENTS > ORGANISMS > DETAIL LEAD SECTION ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
import { useTheme } from 'styled-components';
import ContentLoader from 'react-content-loader';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    DetailLeadBackLink,
    DetailLeadCompany,
    DetailLeadContent,
    DetailLeadDescription,
    DetailLeadMetric,
    DetailLeadMetricDescription,
    DetailLeadSectionContainer,
    DetailLeadTitle,
    DetailLeadValue,
    DetailLeadValueLoading,
} from './detail-lead-section.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
interface IDetailLeadSection {
    companyName: string;
    ticker: string;
    title: string;
    value: string;
    description: string;
    isValueLoading?: boolean;
    overviewHref?: string;
}
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................

const DetailLeadSection: React.FC<IDetailLeadSection> = ({
    companyName,
    ticker,
    title,
    value,
    description,
    isValueLoading = false,
    overviewHref = '/',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <DetailLeadSectionContainer data-testid="detail-lead-section">
            <DetailLeadBackLink href={overviewHref} data-testid="detail-lead-section-back">
                ← Back to {ticker} Overview
            </DetailLeadBackLink>
            <DetailLeadContent>
                <DetailLeadCompany data-testid="detail-lead-section-company">
                    {companyName} · {ticker}
                </DetailLeadCompany>
                <DetailLeadTitle data-testid="detail-lead-section-title">
                    {title}
                </DetailLeadTitle>
                <DetailLeadDescription data-testid="detail-lead-section-description">
                    {description}
                </DetailLeadDescription>
            </DetailLeadContent>
            <DetailLeadMetric data-testid="detail-lead-section-metric">
                {isValueLoading ? (
                    <DetailLeadValueLoading
                        data-testid="detail-lead-section-value-loading"
                        role="status"
                    >
                        <ContentLoader
                            aria-label="Loading current return on equity"
                            backgroundColor={theme.background.loader}
                            foregroundColor={theme.border.subtle}
                            height={44}
                            preserveAspectRatio="none"
                            title="Loading current return on equity"
                            uniqueKey="detail-lead-section-value-loading"
                            viewBox="0 0 180 44"
                            width="100%"
                        >
                            <rect height="44" rx="2" width="100%" x="0" y="0" />
                        </ContentLoader>
                    </DetailLeadValueLoading>
                ) : (
                    <DetailLeadValue data-testid="detail-lead-section-value">
                        {value}
                    </DetailLeadValue>
                )}
                <DetailLeadMetricDescription data-testid="detail-lead-section-metric-description">
                    {description}
                </DetailLeadMetricDescription>
            </DetailLeadMetric>
        </DetailLeadSectionContainer>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default DetailLeadSection;

// END FILE ##########################################################################################
