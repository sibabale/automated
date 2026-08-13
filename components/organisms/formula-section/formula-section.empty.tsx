// [ COMPONENTS > ORGANISMS > FORMULA SECTION EMPTY ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
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
interface IFormulaSectionEmpty {
    message?: string;
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const FormulaSectionEmpty: React.FC<IFormulaSectionEmpty> = ({
    message = 'Financial data for this period has not been loaded yet.',
    title = 'No data available',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <FormulaStateContainer data-testid="formula-section-empty">
            <FormulaStateIcon $variant="empty" aria-hidden="true">
                <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
                    <path d="M7 3h6l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M13 3v5h5M9.5 13h5M9.5 16h5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </FormulaStateIcon>
            <FormulaStateTitle>{title}</FormulaStateTitle>
            <FormulaStateMessage>{message}</FormulaStateMessage>
        </FormulaStateContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default FormulaSectionEmpty;

// END FILE ########################################################################################
