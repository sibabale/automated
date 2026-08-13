// [ THEME > MOTION ] ################################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { css } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERACTION FEEDBACK ...........................................................................
export const pressableBounce = css`
    transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);

    &:active:not(:disabled) {
        transform: scale(0.96);
        transition-duration: 80ms;
        transition-timing-function: ease-out;
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;
// 1.2. END ........................................................................................

// END FILE ########################################################################################
