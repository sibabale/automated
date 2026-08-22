// [ COMPONENTS > MOLECULES > RUNS PAGINATION ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import RunsPagination from './runs-pagination';
import { StyledThemeProvider } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe('RunsPagination', () => {
    it('reports the current page and changes pages', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();

        render(
            <StyledThemeProvider>
                <RunsPagination currentPage={1} totalPages={3} onPageChange={onPageChange} />
            </StyledThemeProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Page 2' }));

        expect(screen.getByTestId('runs-pagination')).toHaveTextContent('Page 1 of 3');
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
