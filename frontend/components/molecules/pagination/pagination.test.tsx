// [ COMPONENTS > MOLECULES > PAGINATION > TEST ] ####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import Pagination from './pagination';
import { StyledThemeProvider } from '../../../theme';
// 1.2. END ..........................................................................................

// 1.3. TEST SUITE ...................................................................................
describe('Pagination', () => {
    const renderPagination = (props: Partial<React.ComponentProps<typeof Pagination>> = {}) => {
        const defaultProps = {
            currentPage: 1,
            totalPages: 5,
            onPageChange: vi.fn(),
            ...props,
        };
        return render(
            <StyledThemeProvider>
                <Pagination {...defaultProps} />
            </StyledThemeProvider>,
        );
    };

    it('renders the page summary', () => {
        renderPagination({ currentPage: 2, totalPages: 10 });
        expect(screen.getByText('Page 2 of 10')).toBeInTheDocument();
    });

    it('renders page number buttons', () => {
        renderPagination({ totalPages: 3 });
        const nav = screen.getByRole('navigation');
        expect(within(nav).getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
        expect(within(nav).getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
        expect(within(nav).getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
    });

    it('marks the current page with aria-current', () => {
        renderPagination({ currentPage: 2, totalPages: 3 });
        expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
    });

    it('calls onPageChange when a page button is clicked', async () => {
        const onPageChange = vi.fn();
        renderPagination({ currentPage: 1, totalPages: 3, onPageChange });
        await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when the next button is clicked', async () => {
        const onPageChange = vi.fn();
        renderPagination({ currentPage: 2, totalPages: 5, onPageChange });
        await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('disables the next button on the last page', () => {
        renderPagination({ currentPage: 3, totalPages: 3 });
        expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });

    it('uses the provided aria-label and testId', () => {
        renderPagination({ ariaLabel: 'Portfolio pages', testId: 'portfolio-pagination' });
        expect(screen.getByRole('navigation', { name: 'Portfolio pages' })).toBeInTheDocument();
        expect(screen.getByTestId('portfolio-pagination')).toBeInTheDocument();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
