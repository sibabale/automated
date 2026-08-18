// [ APP > HOME PAGE ERROR ] #########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    BuyTradeStateAction,
    BuyTradeStateContainer,
    BuyTradeStateDescription,
    BuyTradeStateTitle,
} from './page.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface IHomePageError {
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    title?: string;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
const HomePageError: React.FC<IHomePageError> = ({
    message = 'Please try again in a moment.',
    onRetry,
    retryLabel = 'Try again',
    title = 'Unable to submit paper trade',
}) => {
    return (
        <BuyTradeStateContainer data-testid="home-page-buy-error" role="alert">
            <BuyTradeStateTitle>{title}</BuyTradeStateTitle>
            <BuyTradeStateDescription>{message}</BuyTradeStateDescription>
            {onRetry && (
                <BuyTradeStateAction
                    data-testid="home-page-buy-error-retry"
                    onClick={onRetry}
                    type="button"
                >
                    {retryLabel}
                </BuyTradeStateAction>
            )}
        </BuyTradeStateContainer>
    );
};

export default HomePageError;
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
