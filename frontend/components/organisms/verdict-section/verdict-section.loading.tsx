// [ COMPONENTS > ORGANISMS > VERDICT SECTION LOADING ] #############################################

'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
import { VerdictSectionContainer } from './verdict-section.styles';

interface IVerdictSectionLoading {
    label?: string;
}

const VerdictSectionLoading: React.FC<IVerdictSectionLoading> = ({
    label = 'Loading investment verdict',
}) => {
    const theme = useTheme();

    return (
        <VerdictSectionContainer data-testid="verdict-section-loading" role="status">
            <ContentLoader
                aria-label={label}
                backgroundColor={theme.background.loader}
                foregroundColor={theme.border.subtle}
                height={92}
                preserveAspectRatio="none"
                title={label}
                uniqueKey="verdict-section-loading"
                viewBox="0 0 640 92"
                width="100%"
            >
                <rect height="28" rx="2" width="132" x="0" y="0" />
                <rect height="28" rx="2" width="48%" x="148" y="0" />
                <rect height="14" rx="2" width="100%" x="0" y="52" />
                <rect height="14" rx="2" width="82%" x="0" y="78" />
            </ContentLoader>
        </VerdictSectionContainer>
    );
};

export default VerdictSectionLoading;
