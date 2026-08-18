// [ COMPONENTS > MOLECULES > HEADER POPOVER ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import HeaderPopover from './header-popover';
import { StyledThemeProvider } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe('HeaderPopover', () => {
    it('shows the explanation when the user hovers the trigger', async () => {
        const user = userEvent.setup();

        render(
            <StyledThemeProvider>
                <HeaderPopover
                    description="The number of shares currently held in the portfolio."
                    label="Shares"
                />
            </StyledThemeProvider>,
        );

        await user.hover(screen.getByTestId('header-popover-trigger-shares'));

        expect(screen.getByTestId('header-popover-surface-shares')).toHaveAttribute('role', 'tooltip');
        expect(screen.getByText('The number of shares currently held in the portfolio.')).toBeVisible();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
