// [ COMPONENTS > ORGANISMS > HERO SECTION ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import HeroSection from './hero-section';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderHeroSection = (onSearch = vi.fn()) =>
    render(
        <StyledThemeProvider>
            <HeroSection onSearch={onSearch} />
        </StyledThemeProvider>,
    );

describe('HeroSection', () => {
    it('renders the static hero copy and search interface', () => {
        renderHeroSection();

        expect(screen.getByTestId('hero-section')).toBeVisible();
        expect(screen.getByTestId('hero-section-heading')).toHaveTextContent(
            'Filing Analysis',
        );
        expect(screen.getByTestId('hero-section-heading')).toHaveTextContent(
            'Analyze filing value instantly.',
        );
        expect(screen.getByTestId('hero-section-description')).toHaveTextContent(
            'Qualitative financial appraisal mapping securities to Berkshire Hathaway criteria.',
        );
        expect(screen.getByTestId('hero-section-search')).toBeVisible();
    });

    it('forwards a submitted ticker to its public search callback', async () => {
        const onSearch = vi.fn();
        const user = userEvent.setup();

        renderHeroSection(onSearch);

        await user.type(screen.getByTestId('search-input-field'), 'BRK.B{Enter}');

        expect(onSearch).toHaveBeenCalledWith('BRK.B');
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
