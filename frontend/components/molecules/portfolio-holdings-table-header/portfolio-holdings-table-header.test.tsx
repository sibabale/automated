// [ COMPONENTS > MOLECULES > PORTFOLIO HOLDINGS TABLE HEADER ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { StyledThemeProvider } from '../../../theme';
import PortfolioHoldingsTableHeader from './portfolio-holdings-table-header';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe('PortfolioHoldingsTableHeader', () => {
    it('renders each holdings column label', () => {
        render(<StyledThemeProvider><table><thead><PortfolioHoldingsTableHeader /></thead></table></StyledThemeProvider>);

        expect(screen.getByTestId('portfolio-holdings-table-header')).toBeVisible();
        expect(screen.getByRole('columnheader', { name: 'Buffett score' })).toBeVisible();
    });

    it('explains non-company headers in hover popovers', async () => {
        const user = userEvent.setup();

        render(<StyledThemeProvider><table><thead><PortfolioHoldingsTableHeader /></thead></table></StyledThemeProvider>);

        await user.hover(screen.getByTestId('header-popover-trigger-gain-loss'));

        expect(screen.getByTestId('header-popover-surface-gain-loss')).toHaveAttribute('role', 'tooltip');
        expect(screen.getByText('The unrealized profit or loss compared with the average buy price.')).toBeVisible();
        expect(screen.queryByTestId('header-popover-trigger-company')).not.toBeInTheDocument();
        expect(screen.queryByTestId('header-popover-trigger-ticker')).not.toBeInTheDocument();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
