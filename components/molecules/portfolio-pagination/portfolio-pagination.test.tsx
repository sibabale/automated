// [ COMPONENTS > MOLECULES > PORTFOLIO PAGINATION ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import PortfolioPagination from './portfolio-pagination';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('PortfolioPagination', () => {
    it('reports the current page and requests the selected page', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();

        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <PortfolioPagination currentPage={1} totalPages={3} onPageChange={onPageChange} />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Page 2' }));

        expect(screen.getByTestId('portfolio-pagination')).toHaveTextContent('Page 1 of 3');
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
