// [ COMPONENTS > MOLECULES > PORTFOLIO HOLDINGS TABLE ROW ] #########################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import PortfolioHoldingsTableRow from './portfolio-holdings-table-row';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('PortfolioHoldingsTableRow', () => {
    it('renders every value from a holding', () => {
        render(
            <StyledThemeProvider>
                <table><tbody><PortfolioHoldingsTableRow holding={{ company: 'Apple Inc.', ticker: 'AAPL', shares: '500', averageBuy: '$142.50', current: '$184.25', value: '$92,125.00', gainLoss: '+$20,875.00', score: '8.2' }} /></tbody></table>
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('portfolio-holdings-table-row')).toBeVisible();
        expect(screen.getByText('$92.13K')).toBeVisible();
        expect(screen.getByTestId('portfolio-holdings-gain-loss')).toHaveTextContent(
            '+$20.88K',
        );
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
