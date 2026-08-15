// [ COMPONENTS > STATES > COMPONENT EMPTY ] #########################################################

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
interface IComponentEmpty {
    actionLabel?: string;
    message?: string;
    onAction?: () => void;
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const ComponentEmpty: React.FC<IComponentEmpty> = ({
    actionLabel,
    message = 'There are no counter entries to display yet.',
    onAction,
    title = 'Nothing here yet',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <ComponentStateContainer data-testid="component-empty">
            <ComponentStateTitle>{title}</ComponentStateTitle>
            <ComponentStateMessage>{message}</ComponentStateMessage>
            {actionLabel && onAction && (
                <ComponentStateAction data-testid="component-empty-action" onClick={onAction} type="button">
                    {actionLabel}
                </ComponentStateAction>
            )}
        </ComponentStateContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default ComponentEmpty;

// END FILE ########################################################################################
