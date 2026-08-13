// [ COMPONENTS > ORGANISMS > EDUCATIONAL SECTION ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import EducationalSection from './educational-section';
import EducationalSectionLoading from './educational-section.loading';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const educationalProps = {
    definitionTitle: 'What Is Return on Equity?',
    definition: 'Return on Equity measures the net income returned as a percentage of shareholders equity.',
    importanceTitle: 'Why ROE Matters',
    importance: ['High returns can indicate a durable competitive advantage.'],
    quote: '"Consistently high return on equity matters."',
    quoteAuthor: 'Warren Buffett',
    quoteAuthorTitle: 'Chairman and CEO',
    mobileImportance: 'High returns can indicate a durable competitive advantage.',
    mobileQuote: '"Consistently high return on equity matters."',
};

describe('EducationalSection', () => {
    it('renders the supplied educational content', () => {
        render(
            <StyledThemeProvider>
                <EducationalSection {...educationalProps} />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('educational-section')).toHaveTextContent(
            'What Is Return on Equity?',
        );
        expect(screen.getByTestId('educational-section')).toHaveTextContent('Warren Buffett');
    });

    it('announces educational content loading', () => {
        render(
            <StyledThemeProvider>
                <EducationalSectionLoading />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('educational-section-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading metric education')).toBeVisible();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
