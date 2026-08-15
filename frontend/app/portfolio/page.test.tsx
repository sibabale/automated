// [ APP > PORTFOLIO PAGE ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    afterEach(() => {
        vi.useRealTimers();
    });

    it('keeps the page shell available and announces portfolio loading', () => {
        renderPortfolioPage();

        expect(screen.getByTestId('header')).toBeVisible();
        expect(screen.getByTestId('portfolio-page')).toBeVisible();
        expect(screen.getByTestId('portfolio-metrics-loading')).toHaveAttribute('role', 'status');
        expect(screen.getAllByLabelText('Loading portfolio data')).not.toHaveLength(0);
        expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });

    it('renders portfolio valuation and all visible holdings', () => {
        vi.useFakeTimers();
        renderPortfolioPage();
        act(() => {
            vi.advanceTimersByTime(5_000);
        });

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
