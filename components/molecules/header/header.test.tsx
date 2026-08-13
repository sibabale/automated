// [ COMPONENTS > MOLECULES > HEADER ] #############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import Header from './header';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................

const renderHeader = () =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <Header />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('Header', () => {
    it('renders the visible brand and navigation control', () => {
        renderHeader();

        expect(screen.getByTestId('header')).toBeVisible();
        expect(screen.getByTestId('header-logo')).toBeVisible();
        expect(screen.getByTestId('header-menu-toggle')).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        expect(screen.queryByTestId('header-signin')).not.toBeInTheDocument();
        expect(screen.queryByTestId('header-create-account')).not.toBeInTheDocument();
    });

    it('switches the selected color mode', async () => {
        const user = userEvent.setup();

        renderHeader();

        const modeToggle = screen.getByRole('switch', { name: 'Switch to dark mode' });

        expect(modeToggle).toHaveAttribute('aria-checked', 'false');

        await user.click(modeToggle);

        expect(modeToggle).toHaveAttribute('aria-checked', 'true');
        expect(modeToggle).toHaveAccessibleName('Switch to light mode');
    });

    it('opens the mobile navigation and exposes every navigation item', async () => {
        const user = userEvent.setup();

        renderHeader();

        const menuButton = screen.getByTestId('header-menu-toggle');

        await user.click(menuButton);

        expect(menuButton).toHaveAttribute('aria-expanded', 'true');

        const mobileNavigation = screen.getByTestId('header-mobile-navigation');

        await waitFor(() => {
            [
                'header-mobile-about',
                'header-mobile-methodology',
                'header-mobile-portfolio',
            ].forEach((testId) => {
                    expect(
                        within(mobileNavigation).getByTestId(testId),
                    ).toBeVisible();
            });
        }, { timeout: 3000 });
    });

    it('links to the portfolio page', () => {
        renderHeader();

        expect(screen.getByTestId('header-portfolio').querySelector('a')).toHaveAttribute(
            'href',
            '/portfolio',
        );
    });

    it('closes the mobile navigation from the menu button', async () => {
        const user = userEvent.setup();

        renderHeader();

        const menuButton = screen.getByTestId('header-menu-toggle');

        await user.click(menuButton);
        await user.click(menuButton);

        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('removes the mobile navigation after its exit transition completes', async () => {
        const user = userEvent.setup();

        renderHeader();

        const menuButton = screen.getByTestId('header-menu-toggle');

        await user.click(menuButton);
        await user.click(menuButton);

        await waitFor(() => {
            expect(
                screen.queryByTestId('header-mobile-navigation'),
            ).not.toBeInTheDocument();
        });
    });
});

// 1.3. END ........................................................................................

// END FILE ########################################################################################
