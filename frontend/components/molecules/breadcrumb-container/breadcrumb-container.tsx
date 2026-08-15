// [ COMPONENTS > MOLECULES > BREADCRUMB CONTAINER ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    BreadcrumbContainer,
    BreadcrumbCurrent,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbSource,
    BreadcrumbTrail,
} from './breadcrumb-container.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IBreadcrumbContainer {
    companyName: string;
    ticker: string;
    currentLabel: string;
    overviewHref?: string;
    sourceLabel?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const BreadcrumbContainerComponent: React.FC<IBreadcrumbContainer> = ({
    companyName,
    ticker,
    currentLabel,
    overviewHref = '/',
    sourceLabel = 'SEC Filing Data · USD',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ........................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ........................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <BreadcrumbContainer aria-label="Breadcrumb" data-testid="breadcrumb-container">
            <BreadcrumbTrail>
                <li>
                    <BreadcrumbLink href={overviewHref} data-testid="breadcrumb-container-overview">
                        ← Back to Overview
                    </BreadcrumbLink>
                </li>
                <li aria-hidden="true">
                    <BreadcrumbSeparator>|</BreadcrumbSeparator>
                </li>
                <li data-testid="breadcrumb-container-company">
                    {companyName} ({ticker})
                </li>
                <li aria-hidden="true">
                    <BreadcrumbSeparator>›</BreadcrumbSeparator>
                </li>
                <li>
                    <BreadcrumbCurrent data-testid="breadcrumb-container-current">
                        {currentLabel}
                    </BreadcrumbCurrent>
                </li>
            </BreadcrumbTrail>
            <BreadcrumbSource data-testid="breadcrumb-container-source">
                {sourceLabel}
            </BreadcrumbSource>
        </BreadcrumbContainer>
    );
    // 1.6.3. END ........................................................................................
};

// 1.6. END ........................................................................................

export default BreadcrumbContainerComponent;

// END FILE ########################################################################################
