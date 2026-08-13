// [ COMPONENTS > MOLECULES > HORIZON CARD ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import { useReducedMotion } from 'motion/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import TrendBadge from '../../atoms/trend-badge/trend-badge';
import {
    HorizonCardBreakdown,
    HorizonCardBreakdownItem,
    HorizonCardBreakdownLabel,
    HorizonCardBreakdownList,
    HorizonCardBreakdownPeriod,
    HorizonCardBreakdownValue,
    HorizonCardContainer,
    HorizonCardHeader,
    HorizonCardInsight,
    HorizonCardInsightIcon,
    HorizonCardRange,
    HorizonCardTitle,
    HorizonCardTitleGroup,
    HorizonCardValue,
} from './horizon-card.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IHorizonCard {
    label: string;
    range: string;
    value: string;
    breakdown: Array<{
        period: string;
        value: string;
    }>;
    insight: string;
    trend: 'up' | 'down';
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const HorizonCard: React.FC<IHorizonCard> = ({
    label,
    range,
    value,
    breakdown,
    insight,
    trend,
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const shouldReduceMotion = useReducedMotion();
    // 1.6.1. END ........................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ........................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <HorizonCardContainer
            data-testid="horizon-card"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
        >
            <HorizonCardHeader>
                <HorizonCardTitleGroup>
                    <HorizonCardTitle data-testid="horizon-card-title">{label}</HorizonCardTitle>
                    <HorizonCardRange data-testid="horizon-card-range">{range}</HorizonCardRange>
                </HorizonCardTitleGroup>
                <TrendBadge variant={trend} />
            </HorizonCardHeader>
            <HorizonCardValue data-testid="horizon-card-value">{value}</HorizonCardValue>
            <HorizonCardBreakdown>
                <HorizonCardBreakdownLabel>Yearly Breakdown</HorizonCardBreakdownLabel>
                <HorizonCardBreakdownList data-testid="horizon-card-breakdown">
                    {breakdown.map((item) => (
                        <HorizonCardBreakdownItem key={item.period}>
                            <HorizonCardBreakdownPeriod>{item.period}</HorizonCardBreakdownPeriod>
                            <HorizonCardBreakdownValue>{item.value}</HorizonCardBreakdownValue>
                        </HorizonCardBreakdownItem>
                    ))}
                </HorizonCardBreakdownList>
            </HorizonCardBreakdown>
            <HorizonCardInsight data-testid="horizon-card-insight">
                <HorizonCardInsightIcon aria-hidden="true">ⓘ</HorizonCardInsightIcon>
                {insight}
            </HorizonCardInsight>
        </HorizonCardContainer>
    );
    // 1.6.3. END ........................................................................................
};

// 1.6. END ........................................................................................

export default HorizonCard;

// END FILE ########################################################################################
