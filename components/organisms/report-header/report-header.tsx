// [ COMPONENTS > ORGANISMS > REPORT HEADER ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import { MotionConfig } from 'motion/react';
import type { Variants } from 'motion/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    ReportHeaderContainer,
    ReportIdentity,
    ReportMeta,
    ReportMetaItem,
    ReportMetaSeparator,
    ReportScore,
    ReportScoreDescription,
    ReportScoreLabel,
    ReportScoreSummary,
    ReportScoreValue,
    ReportTicker,
    ReportTitle,
    ReportValuation,
} from './report-header.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
const reportHeaderVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

const reportScoreVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.35, ease: 'easeOut', delay: 0.1 },
    },
};
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IReportHeader {
    companyName?: string;
    ticker?: string;
    sector?: string;
    industry?: string;
    valuation?: string;
    score?: string;
    scoreLabel?: string;
    scoreDescription?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const ReportHeader: React.FC<IReportHeader> = ({
    companyName = 'Apple Inc.',
    ticker = 'AAPL',
    sector = 'Technology',
    industry = 'Consumer Electronics',
    valuation = '$184.25 USD',
    score = '8.2',
    scoreLabel = 'Buffett Score',
    scoreDescription = 'Strong Moat Profile',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <MotionConfig reducedMotion="user">
            <ReportHeaderContainer data-testid="report-header">
                <ReportIdentity
                    data-testid="report-header-identity"
                    initial="hidden"
                    animate="visible"
                    variants={reportHeaderVariants}
                >
                    <ReportTitle data-testid="report-header-title">
                        {companyName}
                    </ReportTitle>
                    <ReportTicker data-testid="report-header-ticker">
                        {ticker}
                    </ReportTicker>
                    <ReportMeta data-testid="report-header-meta">
                        <ReportMetaItem data-testid="report-header-sector">
                            {sector}
                        </ReportMetaItem>
                        <ReportMetaSeparator aria-hidden="true">•</ReportMetaSeparator>
                        <ReportMetaItem data-testid="report-header-industry">
                            {industry}
                        </ReportMetaItem>
                    </ReportMeta>
                    <ReportValuation data-testid="report-header-valuation">
                        {valuation}
                    </ReportValuation>
                </ReportIdentity>
                <ReportScore
                    data-testid="report-header-score"
                    initial="hidden"
                    animate="visible"
                    variants={reportScoreVariants}
                >
                    <ReportScoreSummary data-testid="report-header-score-summary">
                        <ReportScoreLabel data-testid="report-header-score-label">
                            {scoreLabel}
                        </ReportScoreLabel>
                        <ReportScoreDescription data-testid="report-header-score-description">
                            {scoreDescription}
                        </ReportScoreDescription>
                    </ReportScoreSummary>
                    <ReportScoreValue data-testid="report-header-score-value">
                        {score}
                    </ReportScoreValue>
                </ReportScore>
            </ReportHeaderContainer>
        </MotionConfig>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default ReportHeader;

// END FILE ########################################################################################
