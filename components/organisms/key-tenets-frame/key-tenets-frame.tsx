// [ COMPONENTS > ORGANISMS > KEY TENETS FRAME ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import MetricCard from '../../molecules/metric-card/metric-card';
import {
    KeyTenetsFrameContainer,
    KeyTenetsHeading,
    KeyTenetsMetrics,
} from './key-tenets-frame.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IKeyTenetsFrame {
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const KeyTenetsFrame: React.FC<IKeyTenetsFrame> = ({
    title = 'Key Tenets & Ratios',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <KeyTenetsFrameContainer data-testid="key-tenets-frame">
            <KeyTenetsHeading data-testid="key-tenets-frame-title">
                {title}
            </KeyTenetsHeading>
            <KeyTenetsMetrics data-testid="key-tenets-frame-metrics">
                <MetricCard
                    label="Return on Equity"
                    value="21.3%"
                    description="Buffett Target: > 15%"
                />
                <MetricCard
                    label="Free Cash Flow"
                    value="$110.5B"
                    description="Consistent expansion"
                />
                <MetricCard
                    label="Debt-to-Equity"
                    value="1.87"
                    description="Highly serviceable"
                />
                <MetricCard
                    label="Profit Margin"
                    value="25.3%"
                    description="Industry leading"
                />
                <MetricCard
                    label="Margin of Safety"
                    value="18%"
                    description="Undervalued buffer"
                />
            </KeyTenetsMetrics>
        </KeyTenetsFrameContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default KeyTenetsFrame;

// END FILE ########################################################################################
