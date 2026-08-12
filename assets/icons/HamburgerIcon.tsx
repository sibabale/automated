// [ ASSETS > ICONS > HAMBURGER ICON ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import React from 'react';
// 1.1. END ........................................................................................

// 1.2. TYPES ......................................................................................
interface IHamburgerIcon {
    size?: number;
    color?: string;
}
// 1.2. END ........................................................................................

// 1.3. COMPONENT ..................................................................................

const HamburgerIcon: React.FC<IHamburgerIcon> = ({ size = 20, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
    >
        <rect x="2"  y="3"  width="16" height="2" fill={color} />
        <rect x="2"  y="9"  width="16" height="2" fill={color} />
        <rect x="2"  y="15" width="16" height="2" fill={color} />
    </svg>
);

// 1.3. END ........................................................................................

export default HamburgerIcon;

// END FILE ########################################################################################
