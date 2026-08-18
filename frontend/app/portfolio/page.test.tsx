// [ APP > PORTFOLIO PAGE ] ##########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import PortfolioPage from './page';
import ReduxProvider from '../../redux/provider';
import { StyledThemeProvider } from '../../theme';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
const renderPortfolioPage = () =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <PortfolioPage />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('PortfolioPage', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('keeps the page shell available and announces portfolio loading', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
        renderPortfolioPage();

        expect(screen.getByTestId('header')).toBeVisible();
        expect(screen.getByTestId('portfolio-page')).toBeVisible();
        expect(screen.getByTestId('portfolio-metrics-loading')).toHaveAttribute('role', 'status');
        expect(screen.getAllByLabelText('Loading portfolio data')).not.toHaveLength(0);
        expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    });

    it('renders portfolio valuation and all visible holdings', () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    mode: 'paper',
                    summary: {
                        totalValue: '$1260.00',
                        totalInvested: '$1200.00',
                        totalGainLoss: '$60.00',
                        totalGainPercentage: '5.0%',
                        averageScoreAtPurchase: '9.2',
                    },
                    positions: [
                        {
                            companyName: 'Microsoft Corporation',
                            ticker: 'MSFT',
                            quantity: 3,
                            averageEntryPrice: '$400.00',
                            currentPrice: '$420.00',
                            marketValue: '$1260.00',
                            unrealizedGainLoss: '$60.00',
                            scoreAtPurchase: '9.2',
                        },
                    ],
                },
            }),
        }));
        renderPortfolioPage();

        return screen.findAllByText('Microsoft Corporation').then(() => {
            expect(screen.getByTestId('portfolio-page')).toBeVisible();
            expect(screen.getAllByText('Microsoft Corporation')).toHaveLength(2);
            expect(screen.getAllByText('Current Market Value')).not.toHaveLength(0);
            expect(screen.getAllByText('Value at Purchase')).not.toHaveLength(0);
            expect(screen.getAllByText('$1.2K')).not.toHaveLength(0);
            expect(screen.getAllByText('9.2/10')).not.toHaveLength(0);
        });
    });

    it('renders disabled pagination when the holdings fit within one page', () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    mode: 'paper',
                    summary: {
                        totalValue: '$1260.00',
                        totalInvested: '$1200.00',
                        totalGainLoss: '$60.00',
                        totalGainPercentage: '5.0%',
                        averageScoreAtPurchase: '9.2',
                    },
                    positions: [
                        {
                            companyName: 'Microsoft Corporation',
                            ticker: 'MSFT',
                            quantity: 3,
                            averageEntryPrice: '$400.00',
                            currentPrice: '$420.00',
                            marketValue: '$1260.00',
                            unrealizedGainLoss: '$60.00',
                            scoreAtPurchase: '9.2',
                        },
                    ],
                },
            }),
        }));
        renderPortfolioPage();

        return screen.findByTestId('portfolio-pagination').then(() => {
            expect(screen.getByTestId('portfolio-pagination')).toHaveTextContent('Page 1 of 1');
            expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
        });
    });

    it('renders an empty state when the portfolio has no holdings', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    mode: 'paper',
                    summary: {
                        totalValue: '$0.00',
                        totalInvested: '$0.00',
                        totalGainLoss: '$0.00',
                        totalGainPercentage: null,
                        averageScoreAtPurchase: null,
                    },
                    positions: [],
                },
            }),
        }));
        renderPortfolioPage();

        expect(await screen.findByTestId('portfolio-page-empty')).toBeVisible();
        expect(screen.getByTestId('portfolio-page-empty-action')).toBeVisible();
    });

    it('renders a retryable error state when the portfolio request fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        renderPortfolioPage();

        expect(await screen.findByTestId('portfolio-page-error')).toHaveAttribute('role', 'alert');
        expect(screen.getByTestId('portfolio-page-error-retry')).toBeVisible();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
