// [ COMPONENTS > ORGANISMS > REPORT HEADER LOADING ] ################################################

'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
import {
    ReportHeaderContainer,
    ReportHeaderLoadingIdentity,
    ReportHeaderLoadingScore,
} from './report-header.styles';

interface IReportHeaderLoading {
    label?: string;
}

const ReportHeaderLoading: React.FC<IReportHeaderLoading> = ({
    label = 'Loading company report',
}) => {
    const theme = useTheme();

    return (
        <ReportHeaderContainer data-testid="report-header-loading" role="status">
            <ReportHeaderLoadingIdentity>
                <ContentLoader
                    aria-label={label}
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={88}
                    preserveAspectRatio="none"
                    title={label}
                    uniqueKey="report-header-loading-identity"
                    viewBox="0 0 520 88"
                    width="100%"
                >
                    <rect height="28" rx="2" width="55%" x="0" y="0" />
                    <rect height="16" rx="2" width="64" x="0" y="40" />
                    <rect height="12" rx="2" width="68%" x="0" y="72" />
                </ContentLoader>
            </ReportHeaderLoadingIdentity>
            <ReportHeaderLoadingScore>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={80}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="report-header-loading-score"
                    viewBox="0 0 240 80"
                    width="100%"
                >
                    <rect height="12" rx="2" width="48" x="0" y="0" />
                    <rect height="12" rx="2" width="92" x="0" y="24" />
                    <rect height="80" rx="0" width="80" x="160" y="0" />
                </ContentLoader>
            </ReportHeaderLoadingScore>
        </ReportHeaderContainer>
    );
};

export default ReportHeaderLoading;
