// [ COMPONENTS > ATOMS > TREND BADGE ] ##############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import TrendBadge from './trend-badge';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('TrendBadge', () => {
    it.each([
        ['up', 'Improving trend'],
        ['down', 'Declining trend'],
    ] as const)('renders the %s variant', (variant, label) => {
        render(
            <StyledThemeProvider>
                <TrendBadge variant={variant} />
            </StyledThemeProvider>,
        );

        const badge = screen.getByTestId('trend-badge');

        expect(badge).toHaveAccessibleName(label);
        expect(badge).toHaveAttribute('data-variant', variant);
        expect(badge).toHaveStyle({ width: '28px' });
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
