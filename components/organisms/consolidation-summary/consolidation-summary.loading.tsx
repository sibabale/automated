// [ COMPONENTS > ORGANISMS > CONSOLIDATION SUMMARY LOADING ] ########################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    ConsolidationDesktopCalculation,
    ConsolidationMobileCalculation,
    ConsolidationNote,
    ConsolidationNoteLabel,
    ConsolidationLoadingNoteText,
    ConsolidationSummaryContainer,
    ConsolidationTitle,
} from './consolidation-summary.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IConsolidationSummaryLoading {
    label?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const ConsolidationSummaryLoading: React.FC<IConsolidationSummaryLoading> = ({
    label = 'Loading consolidation summary',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <ConsolidationSummaryContainer data-testid="consolidation-summary-loading" role="status">
            <ConsolidationTitle>
                <ContentLoader
                    aria-label={label}
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={14}
                    preserveAspectRatio="none"
                    title={label}
                    uniqueKey="consolidation-summary-loading-title"
                    viewBox="0 0 320 14"
                    width="100%"
                >
                    <rect height="14" rx="2" width="180" x="0" y="0" />
                </ContentLoader>
            </ConsolidationTitle>
            <ConsolidationMobileCalculation>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={20}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="consolidation-summary-loading-mobile-calculation"
                    viewBox="0 0 360 20"
                    width="100%"
                >
                    <rect height="20" rx="2" width="88%" x="0" y="0" />
                </ContentLoader>
            </ConsolidationMobileCalculation>
            <ConsolidationDesktopCalculation>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={76}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="consolidation-summary-loading-desktop-calculation"
                    viewBox="0 0 520 76"
                    width="100%"
                >
                    <rect height="24" rx="2" width="60%" x="0" y="0" />
                    <rect height="1" rx="0" width="60%" x="0" y="32" />
                    <rect height="24" rx="2" width="45%" x="0" y="44" />
                    <rect height="42" rx="2" width="22%" x="74%" y="16" />
                </ContentLoader>
            </ConsolidationDesktopCalculation>
            <ConsolidationNote>
                <ConsolidationNoteLabel>
                    <ContentLoader
                        aria-hidden="true"
                        backgroundColor={theme.background.loader}
                        foregroundColor={theme.border.subtle}
                        height={14}
                        preserveAspectRatio="none"
                        title=""
                        uniqueKey="consolidation-summary-loading-note-label"
                        viewBox="0 0 240 14"
                        width="100%"
                    >
                        <rect height="14" rx="2" width="110" x="0" y="0" />
                    </ContentLoader>
                </ConsolidationNoteLabel>
                <ConsolidationLoadingNoteText>
                    <ContentLoader
                        aria-hidden="true"
                        backgroundColor={theme.background.loader}
                        foregroundColor={theme.border.subtle}
                        height={125}
                        preserveAspectRatio="none"
                        title=""
                        uniqueKey="consolidation-summary-loading-note-mobile"
                        viewBox="0 0 480 125"
                        width="100%"
                    >
                        <rect height="16" rx="2" width="100%" x="0" y="0" />
                        <rect height="16" rx="2" width="88%" x="0" y="36" />
                        <rect height="16" rx="2" width="62%" x="0" y="72" />
                    </ContentLoader>
                    <ContentLoader
                        aria-hidden="true"
                        backgroundColor={theme.background.loader}
                        foregroundColor={theme.border.subtle}
                        height={54}
                        preserveAspectRatio="none"
                        title=""
                        uniqueKey="consolidation-summary-loading-note-desktop"
                        viewBox="0 0 480 54"
                        width="100%"
                    >
                        <rect height="16" rx="2" width="100%" x="0" y="0" />
                        <rect height="16" rx="2" width="88%" x="0" y="22" />
                        <rect height="16" rx="2" width="62%" x="0" y="38" />
                    </ContentLoader>
                </ConsolidationLoadingNoteText>
            </ConsolidationNote>
        </ConsolidationSummaryContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default ConsolidationSummaryLoading;

// END FILE ########################################################################################
