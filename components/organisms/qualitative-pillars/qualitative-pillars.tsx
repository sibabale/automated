// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import CriteriaCard from '../../molecules/criteria-card/criteria-card';
import {
    QualitativePillarsContainer,
    QualitativePillarsGrid,
    QualitativePillarsHeading,
} from './qualitative-pillars.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IQualitativePillars {
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const QualitativePillars: React.FC<IQualitativePillars> = ({
    title = 'Buffett Framework Qualitative Pillars',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <QualitativePillarsContainer data-testid="qualitative-pillars">
            <QualitativePillarsHeading data-testid="qualitative-pillars-title">
                {title}
            </QualitativePillarsHeading>
            <QualitativePillarsGrid data-testid="qualitative-pillars-grid">
                <CriteriaCard
                    label="Durable Competitive Advantage"
                    title="Strong moat via ecosystem lock-in"
                    description="High switching costs coupled with brand intangibles (iOS, Services, and core hardware integration) create an exceptionally wide and self-reinforcing economic moat."
                />
                <CriteriaCard
                    label="Management Quality"
                    title="Excellent capital allocation"
                    description="Proven history of aggressive share buybacks, steady dividend growth, and high return on incremental invested capital under disciplined modern leadership."
                />
                <CriteriaCard
                    label="Predictable Earnings"
                    title="Consistent growth trajectory"
                    description="Multi-year recurring services revenue cushions cyclical hardware replacement timelines, presenting high predictability for future cash flows."
                />
                <CriteriaCard
                    label="Simple Business Model"
                    title="Hardware + Services ecosystem"
                    description="Clear monetization mechanics: premium hardware sales act as the acquisition funnel, while high-margin digital services extract ongoing lifetime customer value."
                />
            </QualitativePillarsGrid>
        </QualitativePillarsContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default QualitativePillars;

// END FILE ########################################################################################
