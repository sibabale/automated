// [ COMPONENTS > MOLECULES > PORTFOLIO HOLDINGS TABLE HEADER ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import PortfolioHoldingsTableHeader from './portfolio-holdings-table-header';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('PortfolioHoldingsTableHeader', () => {
    it('renders each holdings column label', () => {
        render(<StyledThemeProvider><table><thead><PortfolioHoldingsTableHeader /></thead></table></StyledThemeProvider>);

        expect(screen.getByTestId('portfolio-holdings-table-header')).toBeVisible();
        expect(screen.getByRole('columnheader', { name: 'Buffett score' })).toBeVisible();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
