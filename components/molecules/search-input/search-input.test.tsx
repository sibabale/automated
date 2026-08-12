// [ COMPONENTS > MOLECULES > SEARCH INPUT ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import SearchInput from './search-input';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderSearchInput = (onSearch = vi.fn()) =>
    render(
        <StyledThemeProvider>
            <SearchInput onSearch={onSearch} />
        </StyledThemeProvider>,
    );

describe('SearchInput', () => {
    it('renders one unified ticker search form', () => {
        renderSearchInput();

        expect(screen.getByTestId('search-input')).toBeVisible();
        expect(screen.getByTestId('search-input-icon')).toBeInTheDocument();
        expect(screen.getByTestId('search-input-field')).toHaveAttribute(
            'placeholder',
            'Enter ticker symbol (e.g. AAPL)',
        );
        expect(screen.getByTestId('search-input-submit')).toHaveTextContent(
            'Analyze',
        );
    });

    it('submits a ticker search when the button is clicked', async () => {
        const onSearch = vi.fn();
        const user = userEvent.setup();

        renderSearchInput(onSearch);

        await user.type(screen.getByTestId('search-input-field'), 'AAPL');
        await user.click(screen.getByTestId('search-input-submit'));

        expect(onSearch).toHaveBeenCalledWith('AAPL');
    });

    it('submits a ticker search when Enter is pressed in the input', async () => {
        const onSearch = vi.fn();
        const user = userEvent.setup();

        renderSearchInput(onSearch);

        await user.type(screen.getByTestId('search-input-field'), 'MSFT{Enter}');

        expect(onSearch).toHaveBeenCalledWith('MSFT');
    });

    it('does not submit whitespace-only input', async () => {
        const onSearch = vi.fn();
        const user = userEvent.setup();

        renderSearchInput(onSearch);

        await user.type(screen.getByTestId('search-input-field'), '   {Enter}');

        expect(onSearch).not.toHaveBeenCalled();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
