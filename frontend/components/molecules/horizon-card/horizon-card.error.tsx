// [ COMPONENTS > MOLECULES > HORIZON CARD ERROR ] ###################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    HorizonCardStateAction,
    HorizonCardStateContainer,
    HorizonCardStateMessage,
    HorizonCardStateTitle,
} from './horizon-card.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
interface IHorizonCardError {
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    title?: string;
}
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................

const HorizonCardError: React.FC<IHorizonCardError> = ({
    message = 'We could not load the return on equity analysis. Please try again in a moment.',
    onRetry,
    retryLabel = 'Try again',
    title = 'Unable to load analysis',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <HorizonCardStateContainer data-testid="horizon-card-error" role="alert">
            <HorizonCardStateTitle>{title}</HorizonCardStateTitle>
            <HorizonCardStateMessage>{message}</HorizonCardStateMessage>
            {onRetry && (
                <HorizonCardStateAction
                    data-testid="horizon-card-error-retry"
                    onClick={onRetry}
                    type="button"
                >
                    {retryLabel}
                </HorizonCardStateAction>
            )}
        </HorizonCardStateContainer>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default HorizonCardError;

// END FILE ##########################################################################################
