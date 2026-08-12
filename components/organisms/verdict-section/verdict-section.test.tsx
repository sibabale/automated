// [ COMPONENTS > ORGANISMS > VERDICT SECTION ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import VerdictSection from './verdict-section';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderVerdictSection = (props = {}) =>
    render(
        <StyledThemeProvider>
            <VerdictSection {...props} />
        </StyledThemeProvider>,
    );

describe('VerdictSection', () => {
    it('renders the investment verdict summary', () => {
        renderVerdictSection();

        expect(screen.getByTestId('verdict-section')).toBeVisible();
        expect(screen.getByTestId('verdict-section-label')).toHaveTextContent(
            'Investment Verdict',
        );
        expect(screen.getByTestId('verdict-section-title')).toHaveTextContent(
            'Strong Buy Candidate',
        );
    });

    it('renders a long supplied verdict rationale', () => {
        renderVerdictSection({
            verdict: 'Attractive long-term compounder with valuation constraints',
            description: 'The business combines durable consumer demand, recurring services revenue, and disciplined capital allocation while maintaining a modest but meaningful margin of safety.',
        });

        expect(screen.getByTestId('verdict-section-title')).toHaveTextContent(
            'Attractive long-term compounder with valuation constraints',
        );
        expect(screen.getByTestId('verdict-section-description')).toHaveTextContent(
            'The business combines durable consumer demand, recurring services revenue, and disciplined capital allocation while maintaining a modest but meaningful margin of safety.',
        );
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
