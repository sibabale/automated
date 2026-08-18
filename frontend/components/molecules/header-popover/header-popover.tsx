// [ COMPONENTS > MOLECULES > HEADER POPOVER ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React, { useId, useState } from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    HeaderPopoverBody,
    HeaderPopoverButton,
    HeaderPopoverIcon,
    HeaderPopoverSurface,
    HeaderPopoverTitle,
    HeaderPopoverTrigger,
} from './header-popover.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface IHeaderPopover {
    description: string;
    label: string;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
const HeaderPopover: React.FC<IHeaderPopover> = ({
    description,
    label,
}) => {
    // 1.4.1. HOOKS & API CALLS ....................................................................
    const [isOpen, setIsOpen] = useState(false);
    const popoverId = useId();
    // 1.4.1. END ....................................................................................

    // 1.4.2. RENDER .................................................................................
    return (
        <HeaderPopoverTrigger
            data-testid={`header-popover-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <HeaderPopoverButton
                aria-describedby={isOpen ? popoverId : undefined}
                aria-expanded={isOpen}
                data-testid={`header-popover-trigger-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                onBlur={() => setIsOpen(false)}
                onFocus={() => setIsOpen(true)}
                type="button"
            >
                <span>{label}</span>
                <HeaderPopoverIcon aria-hidden="true">i</HeaderPopoverIcon>
            </HeaderPopoverButton>
            {isOpen && (
                <HeaderPopoverSurface
                    data-testid={`header-popover-surface-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    id={popoverId}
                    role="tooltip"
                >
                    <HeaderPopoverTitle>{label}</HeaderPopoverTitle>
                    <HeaderPopoverBody>{description}</HeaderPopoverBody>
                </HeaderPopoverSurface>
            )}
        </HeaderPopoverTrigger>
    );
    // 1.4.2. END ....................................................................................
};

export default HeaderPopover;
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
