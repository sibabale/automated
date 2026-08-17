// [ COMPONENTS > ORGANISMS > KEY TENETS FRAME ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    financialMetrics,
    type IFinancialMetric,
} from '../../../data/financial-metrics';
import MetricCard from '../../molecules/metric-card/metric-card';
import {
    KeyTenetsFrameContainer,
    KeyTenetsHeading,
    KeyTenetsMetrics,
} from './key-tenets-frame.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
interface IKeyTenetsFrame {
    activeTicker?: string;
    metrics?: Array<Pick<IFinancialMetric, 'slug' | 'label' | 'value' | 'description'>>;
    title?: string;
}
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................

const KeyTenetsFrame: React.FC<IKeyTenetsFrame> = ({
    activeTicker = 'AAPL',
    metrics = financialMetrics,
    title = 'Key Tenets & Ratios',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <KeyTenetsFrameContainer data-testid="key-tenets-frame">
            <KeyTenetsHeading data-testid="key-tenets-frame-title">
                {title}
            </KeyTenetsHeading>
            <KeyTenetsMetrics data-testid="key-tenets-frame-metrics">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.slug}
                        href={`/details/${metric.slug}?ticker=${encodeURIComponent(activeTicker)}`}
                        label={metric.label}
                        value={metric.value}
                        description={metric.description}
                    />
                ))}
            </KeyTenetsMetrics>
        </KeyTenetsFrameContainer>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default KeyTenetsFrame;

// END FILE ##########################################################################################
