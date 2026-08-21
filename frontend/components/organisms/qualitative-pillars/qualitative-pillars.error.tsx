// [ COMPONENTS > STATES > QUALITATIVE PILLARS ERROR ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    QualitativePillarsRetryButton,
    QualitativePillarsStateContainer,
    QualitativePillarsStateDescription,
    QualitativePillarsStateTitle,
} from './qualitative-pillars.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
interface IQualitativePillarsError {
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    title?: string;
}
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................

const QualitativePillarsError: React.FC<IQualitativePillarsError> = ({
    message = 'We could not load the qualitative analysis. Please try again in a moment.',
    onRetry,
    retryLabel = 'Try again',
    title = 'Unable to load qualitative analysis',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <QualitativePillarsStateContainer data-testid="qualitative-pillars-error" role="alert">
            <QualitativePillarsStateTitle>{title}</QualitativePillarsStateTitle>
            <QualitativePillarsStateDescription>{message}</QualitativePillarsStateDescription>
            {onRetry && (
                <QualitativePillarsRetryButton
                    data-testid="qualitative-pillars-error-retry"
                    onClick={onRetry}
                    type="button"
                >
                    {retryLabel}
                </QualitativePillarsRetryButton>
            )}
        </QualitativePillarsStateContainer>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default QualitativePillarsError;

// END FILE ##########################################################################################
