// [ COMPONENTS > ORGANISMS > FORMULA SECTION ERROR ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    FormulaStateAction,
    FormulaStateContainer,
    FormulaStateIcon,
    FormulaStateMessage,
    FormulaStateTitle,
} from './formula-section.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IFormulaSectionError {
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const FormulaSectionError: React.FC<IFormulaSectionError> = ({
    message = 'Something went wrong while fetching financial data. Please try again later.',
    onRetry,
    retryLabel = 'Try again',
    title = 'Unable to load data',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <FormulaStateContainer data-testid="formula-section-error" role="alert">
            <FormulaStateIcon $variant="error" aria-hidden="true">
                <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                </svg>
            </FormulaStateIcon>
            <FormulaStateTitle>{title}</FormulaStateTitle>
            <FormulaStateMessage>{message}</FormulaStateMessage>
            {onRetry && (
                <FormulaStateAction data-testid="formula-section-error-retry" onClick={onRetry} type="button">
                    {retryLabel}
                </FormulaStateAction>
            )}
        </FormulaStateContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default FormulaSectionError;

// END FILE ########################################################################################
