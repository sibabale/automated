// [ COMPONENTS > STATES > COMPONENT ERROR ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    ComponentStateAction,
    ComponentStateContainer,
    ComponentStateMessage,
    ComponentStateTitle,
} from './component.example.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IComponentError {
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const ComponentError: React.FC<IComponentError> = ({
    message = 'The counter entries could not be loaded.',
    onRetry,
    retryLabel = 'Try again',
    title = 'Unable to load counter content',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <ComponentStateContainer data-testid="component-error" role="alert">
            <ComponentStateTitle>{title}</ComponentStateTitle>
            <ComponentStateMessage>{message}</ComponentStateMessage>
            {onRetry && (
                <ComponentStateAction data-testid="component-error-retry" onClick={onRetry} type="button">
                    {retryLabel}
                </ComponentStateAction>
            )}
        </ComponentStateContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default ComponentError;

// END FILE ########################################################################################
