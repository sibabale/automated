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
                        { slug: 'return-on-equity', value: '35.0%' },
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
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
