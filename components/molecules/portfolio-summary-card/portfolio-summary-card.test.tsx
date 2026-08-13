// [ COMPONENTS > MOLECULES > PORTFOLIO SUMMARY CARD ] ################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import PortfolioSummaryCard from './portfolio-summary-card';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('PortfolioSummaryCard', () => {
    it('renders its metric and optional supporting description', () => {
        render(
            <StyledThemeProvider>
                <PortfolioSummaryCard label="Total value" value="$1,247,832.50" description="↗ +12.4% YTD" trend="up" />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('portfolio-summary-card')).toBeVisible();
        expect(screen.getByText('$1,247,832.50')).toBeVisible();
        expect(screen.getByText('↗ +12.4% YTD')).toBeVisible();
        expect(screen.getByText('$1,247,832.50')).toHaveStyle({
            color: '#29B56B',
        });
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
