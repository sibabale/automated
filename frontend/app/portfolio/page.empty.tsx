// [ APP > PORTFOLIO PAGE EMPTY ] ####################################################################

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
interface IPortfolioPageEmpty {
    actionLabel?: string;
    message?: string;
    onAction?: () => void;
    title?: string;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
const PortfolioPageEmpty: React.FC<IPortfolioPageEmpty> = ({
    actionLabel,
    message = 'No holdings have been recorded for this portfolio yet.',
    onAction,
    title = 'Portfolio is empty',
}) => {
    return (
        <PortfolioStateContainer data-testid="portfolio-page-empty">
            <PortfolioStateTitle>{title}</PortfolioStateTitle>
            <PortfolioStateDescription>{message}</PortfolioStateDescription>
            {actionLabel && onAction && (
                <PortfolioStateAction
                    data-testid="portfolio-page-empty-action"
                    onClick={onAction}
                    type="button"
                >
                    {actionLabel}
                </PortfolioStateAction>
            )}
        </PortfolioStateContainer>
    );
};

export default PortfolioPageEmpty;
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
