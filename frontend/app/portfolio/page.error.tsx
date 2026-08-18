// [ APP > PORTFOLIO PAGE ERROR ] ####################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    PortfolioStateAction,
    PortfolioStateContainer,
    PortfolioStateDescription,
    PortfolioStateTitle,
} from './page.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface IPortfolioPageError {
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    title?: string;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
const PortfolioPageError: React.FC<IPortfolioPageError> = ({
    message = 'Please try again in a moment.',
    onRetry,
    retryLabel = 'Try again',
    title = 'Unable to load portfolio',
}) => {
    return (
        <PortfolioStateContainer data-testid="portfolio-page-error" role="alert">
            <PortfolioStateTitle>{title}</PortfolioStateTitle>
            <PortfolioStateDescription>{message}</PortfolioStateDescription>
            {onRetry && (
                <PortfolioStateAction
                    data-testid="portfolio-page-error-retry"
                    onClick={onRetry}
                    type="button"
                >
                    {retryLabel}
                </PortfolioStateAction>
            )}
        </PortfolioStateContainer>
    );
};

export default PortfolioPageError;
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
