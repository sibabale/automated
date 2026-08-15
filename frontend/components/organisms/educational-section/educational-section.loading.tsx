// [ COMPONENTS > ORGANISMS > EDUCATIONAL SECTION LOADING ] #########################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    EducationalLoadingCopy,
    EducationalLoadingQuote,
    EducationalSectionContainer,
} from './educational-section.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IEducationalSectionLoading {
    label?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const EducationalSectionLoading: React.FC<IEducationalSectionLoading> = ({
    label = 'Loading metric education',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <EducationalSectionContainer data-testid="educational-section-loading" role="status">
            <EducationalLoadingCopy>
                <ContentLoader
                    aria-label={label}
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={304}
                    preserveAspectRatio="none"
                    title={label}
                    uniqueKey="educational-section-loading-copy"
                    viewBox="0 0 640 304"
                    width="100%"
                >
                    <rect height="14" rx="2" width="180" x="0" y="0" />
                    <rect height="16" rx="2" width="100%" x="0" y="34" />
                    <rect height="16" rx="2" width="92%" x="0" y="62" />
                    <rect height="16" rx="2" width="78%" x="0" y="90" />
                    <rect height="14" rx="2" width="210" x="0" y="134" />
                    <rect height="16" rx="2" width="100%" x="0" y="168" />
                    <rect height="16" rx="2" width="94%" x="0" y="196" />
                    <rect height="16" rx="2" width="86%" x="0" y="224" />
                    <rect height="16" rx="2" width="72%" x="0" y="252" />
                </ContentLoader>
            </EducationalLoadingCopy>
            <EducationalLoadingQuote>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={304}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="educational-section-loading-quote"
                    viewBox="0 0 360 304"
                    width="100%"
                >
                    <rect height="48" rx="2" width="28" x="0" y="0" />
                    <rect height="20" rx="2" width="100%" x="0" y="76" />
                    <rect height="20" rx="2" width="94%" x="0" y="108" />
                    <rect height="20" rx="2" width="82%" x="0" y="140" />
                    <rect height="16" rx="2" width="45%" x="0" y="202" />
                    <rect height="14" rx="2" width="60%" x="0" y="230" />
                </ContentLoader>
            </EducationalLoadingQuote>
        </EducationalSectionContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default EducationalSectionLoading;

// END FILE ########################################################################################
