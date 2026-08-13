// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS LOADING ] #########################################

'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
import {
    QualitativePillarsContainer,
    QualitativePillarsGrid,
    QualitativePillarsLoadingCard,
    QualitativePillarsLoadingTitle,
} from './qualitative-pillars.styles';

interface IQualitativePillarsLoading {
    label?: string;
}

const QualitativePillarsLoading: React.FC<IQualitativePillarsLoading> = ({
    label = 'Loading qualitative pillars',
}) => {
    const theme = useTheme();

    return (
        <QualitativePillarsContainer data-testid="qualitative-pillars-loading" role="status">
            <QualitativePillarsLoadingTitle aria-label={label} />
            <QualitativePillarsGrid>
                {Array.from({ length: 4 }, (_, index) => (
                    <QualitativePillarsLoadingCard key={index}>
                        <ContentLoader
                            aria-hidden="true"
                            backgroundColor={theme.background.loader}
                            foregroundColor={theme.border.subtle}
                            height={112}
                            preserveAspectRatio="none"
                            title=""
                            uniqueKey={`qualitative-pillars-loading-card-${index}`}
                            viewBox="0 0 320 112"
                            width="100%"
                        >
                            <rect height="12" rx="2" width="48%" x="0" y="0" />
                            <rect height="20" rx="2" width="78%" x="0" y="28" />
                            <rect height="12" rx="2" width="100%" x="0" y="68" />
                            <rect height="12" rx="2" width="86%" x="0" y="92" />
                        </ContentLoader>
                    </QualitativePillarsLoadingCard>
                ))}
            </QualitativePillarsGrid>
        </QualitativePillarsContainer>
    );
};

export default QualitativePillarsLoading;
