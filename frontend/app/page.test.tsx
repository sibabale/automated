// [ APP > HOME PAGE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import HomePage from './page';
import ReduxProvider from '../redux/provider';
import { StyledThemeProvider } from '../theme';
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
const push = vi.fn();
let currentSearch = 'ticker=MSFT';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
    useSearchParams: () => new URLSearchParams(currentSearch),
}));

const renderHomePage = () =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <HomePage />
            </StyledThemeProvider>
        </ReduxProvider>,
    );
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
beforeEach(() => {
    currentSearch = 'ticker=MSFT';
    push.mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('HomePage', () => {
    it('fetches the overview for the ticker in the URL and renders the returned company context', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-home-001');
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                data: {
                    reportHeader: {
                        companyName: 'Microsoft Corporation',
                        industry: 'Software',
                        sector: 'Technology',
                        sharePrice: '$512.34 USD',
                        ticker: 'MSFT',
                    },
                    metrics: [
                        {
                            slug: 'return-on-equity',
                            value: '35.0%',
                            strength: 'strong',
                            description: 'Strong shareholder returns',
                        },
                    ],
                },
            }),
        }));

        renderHomePage();

        await waitFor(() => {
            expect(screen.getByTestId('report-header-ticker')).toHaveTextContent('MSFT');
        });
        expect(screen.getByTestId('report-header-title')).toHaveTextContent('Microsoft Corporation');
        expect(screen.getByTestId('search-input-field')).toHaveValue('MSFT');
        expect(screen.getAllByTestId('metric-card')[0]).toHaveAttribute(
            'href',
            '/details/return-on-equity?ticker=MSFT',
        );
    });

    it('pushes a new ticker query when the user submits a search', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                data: {
                    reportHeader: {
                        companyName: 'Microsoft Corporation',
                        industry: 'Software',
                        sector: 'Technology',
                        sharePrice: '$512.34 USD',
                        ticker: 'MSFT',
                    },
                    metrics: [],
                },
            }),
        }));
        const user = userEvent.setup();

        renderHomePage();
        await waitFor(() => {
            expect(screen.getByTestId('search-input-field')).toHaveValue('MSFT');
        });

        await user.clear(screen.getByTestId('search-input-field'));
        await user.type(screen.getByTestId('search-input-field'), 'brk.b{Enter}');

        expect(push).toHaveBeenCalledWith('/?ticker=BRK.B');
    });

    it('replaces the score block with a buy button and opens a paper-trade modal', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                data: {
                    reportHeader: {
                        companyName: 'Microsoft Corporation',
                        industry: 'Software',
                        sector: 'Technology',
                        sharePrice: '$512.34 USD',
                        ticker: 'MSFT',
                    },
                    metrics: [],
                },
            }),
        }));
        const user = userEvent.setup();

        renderHomePage();

        await waitFor(() => {
            expect(screen.getByTestId('report-header-buy-action')).toBeVisible();
        });

        await user.click(screen.getByTestId('report-header-buy-action'));

        expect(screen.getByTestId('home-page-buy-modal')).toHaveAttribute('role', 'dialog');
        expect(screen.getByTestId('home-page-buy-modal-title')).toHaveTextContent('Buy MSFT in paper mode');
        expect(screen.getByTestId('home-page-buy-estimate')).toHaveTextContent('$512.34');
    });

    it('submits a paper market order from the buy modal using the current ticker and quantity', async () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('cid-home-buy-001');
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    data: {
                        reportHeader: {
                            companyName: 'Microsoft Corporation',
                            industry: 'Software',
                            sector: 'Technology',
                            sharePrice: '$512.34 USD',
                            ticker: 'MSFT',
                        },
                        metrics: [],
                    },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({
                    data: {
                        order: {
                            averageFillPrice: null,
                            broker: 'alpaca',
                            brokerOrderId: 'broker-001',
                            clientOrderId: 'paper-buy-001',
                            filledQuantity: null,
                            mode: 'paper',
                            orderType: 'market',
                            quantity: 2,
                            status: 'accepted',
                            submittedAt: '2026-08-18T10:00:00.000Z',
                            ticker: 'MSFT',
                        },
                    },
                }),
            });
        vi.stubGlobal('fetch', fetchMock);
        const user = userEvent.setup();

        renderHomePage();

        await waitFor(() => {
            expect(screen.getByTestId('report-header-buy-action')).toBeVisible();
        });

        await user.click(screen.getByTestId('report-header-buy-action'));
        await user.clear(screen.getByTestId('home-page-buy-quantity'));
        await user.type(screen.getByTestId('home-page-buy-quantity'), '2');
        await user.click(screen.getByTestId('home-page-buy-submit'));

        await waitFor(() => {
            expect(screen.getByTestId('home-page-buy-success')).toBeVisible();
        });
        expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/trades/buy', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-correlation-id': 'cid-home-buy-001',
            },
            body: JSON.stringify({
                mode: 'paper',
                orderType: 'market',
                quantity: 2,
                side: 'buy',
                ticker: 'MSFT',
            }),
        });
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
