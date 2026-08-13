// [ APP > PORTFOLIO PAGE ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../theme';
import PortfolioPage from './page';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderPortfolioPage = () =>
    render(
        <StyledThemeProvider>
            <PortfolioPage />
        </StyledThemeProvider>,
    );

describe('PortfolioPage', () => {
    it('renders portfolio valuation and all visible holdings', () => {
        renderPortfolioPage();

        expect(screen.getByTestId('portfolio-page')).toBeVisible();
        expect(screen.getAllByText('Apple Inc.')).toHaveLength(2);
        expect(screen.getAllByText('$515.25K')).toHaveLength(1);
        expect(screen.queryByText(/draft/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Portfolio valuation trend')).not.toBeInTheDocument();
    });

    it('renders disabled pagination when the holdings fit within one page', () => {
        renderPortfolioPage();

        expect(screen.getByTestId('portfolio-pagination')).toHaveTextContent('Page 1 of 1');
        expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
