// [ COMPONENTS > ORGANISMS > DETAIL LEAD SECTION LOADING ] #########################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    DetailLeadLoadingContent,
    DetailLeadLoadingBack,
    DetailLeadMetric,
    DetailLeadSectionContainer,
} from './detail-lead-section.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IDetailLeadSectionLoading {
    label?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const DetailLeadSectionLoading: React.FC<IDetailLeadSectionLoading> = ({
    label = 'Loading metric details',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <DetailLeadSectionContainer data-testid="detail-lead-section-loading" role="status">
            <DetailLeadLoadingBack>
                <ContentLoader
                    aria-label={label}
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={14}
                    preserveAspectRatio="none"
                    title={label}
                    uniqueKey="detail-lead-section-loading-back"
                    viewBox="0 0 320 14"
                    width="100%"
                >
                    <rect height="14" rx="2" width="132" x="0" y="0" />
                </ContentLoader>
            </DetailLeadLoadingBack>
            <DetailLeadLoadingContent>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={78}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="detail-lead-section-loading-content"
                    viewBox="0 0 560 78"
                    width="100%"
                >
                    <rect height="14" rx="2" width="130" x="0" y="0" />
                    <rect height="34" rx="2" width="85%" x="0" y="24" />
                    <rect height="14" rx="2" width="100%" x="0" y="64" />
                </ContentLoader>
            </DetailLeadLoadingContent>
            <DetailLeadMetric>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={82}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="detail-lead-section-loading-metric"
                    viewBox="0 0 180 82"
                    width="100%"
                >
                    <rect height="44" rx="2" width="100%" x="0" y="0" />
                    <rect height="18" rx="2" width="100%" x="0" y="64" />
                </ContentLoader>
            </DetailLeadMetric>
        </DetailLeadSectionContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default DetailLeadSectionLoading;

// END FILE ########################################################################################
