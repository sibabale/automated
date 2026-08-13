// [ COMPONENTS > MOLECULES > HORIZON CARD LOADING ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    HorizonCardLoadingBreakdown,
    HorizonCardLoadingBreakdownItem,
    HorizonCardLoadingBreakdownList,
    HorizonCardLoadingContainer,
    HorizonCardLoadingHeader,
    HorizonCardLoadingInsight,
    HorizonCardLoadingTitleGroup,
    HorizonCardSkeleton,
} from './horizon-card.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IHorizonCardLoading {
    label?: string;
    loaderKey?: string;
    mobileInsightLines?: 1 | 2;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const HorizonCardLoading: React.FC<IHorizonCardLoading> = ({
    label = 'Loading time horizon analysis',
    loaderKey = 'horizon-card-loading',
    mobileInsightLines = 1,
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <HorizonCardLoadingContainer
            aria-label={label}
            data-testid="horizon-card-loading"
            data-loader-key={loaderKey}
            role="status"
        >
            <HorizonCardLoadingHeader>
                <HorizonCardLoadingTitleGroup>
                    <HorizonCardSkeleton $height="0.8125rem" $width="6.875rem" />
                    <HorizonCardSkeleton $height="0.8125rem" $width="5.25rem" />
                </HorizonCardLoadingTitleGroup>
                <HorizonCardSkeleton $height="1.5rem" $width="1.5rem" />
            </HorizonCardLoadingHeader>
            <HorizonCardSkeleton $height="2rem" $width="46%" />
            <HorizonCardLoadingBreakdown>
                <HorizonCardSkeleton $height="0.8125rem" $width="7.5rem" />
                <HorizonCardLoadingBreakdownList>
                    {[0, 1, 2].map((index) => (
                        <HorizonCardLoadingBreakdownItem key={index}>
                            <HorizonCardSkeleton $height="0.75rem" $width="2.625rem" />
                            <HorizonCardSkeleton $height="1rem" $width="3.625rem" />
                        </HorizonCardLoadingBreakdownItem>
                    ))}
                </HorizonCardLoadingBreakdownList>
            </HorizonCardLoadingBreakdown>
            <HorizonCardLoadingInsight $mobileInsightLines={mobileInsightLines} />
        </HorizonCardLoadingContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default HorizonCardLoading;

// END FILE ########################################################################################
