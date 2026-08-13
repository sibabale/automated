// [ COMPONENTS > ORGANISMS > FOOTER ] ###############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import Footer from './footer';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('Footer', () => {
    it('renders the current year and global navigation copy', () => {
        render(<StyledThemeProvider><Footer /></StyledThemeProvider>);

        expect(screen.getByTestId('footer')).toHaveTextContent(
            `© ${new Date().getFullYear()} oto`,
        );
        expect(screen.getByText('oto')).toBeVisible();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
