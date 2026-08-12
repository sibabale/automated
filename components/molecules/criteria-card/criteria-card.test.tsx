// [ COMPONENTS > MOLECULES > CRITERIA CARD ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import CriteriaCard from './criteria-card';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderCriteriaCard = (props = {
    label: 'Durable Competitive Advantage',
    title: 'Strong moat via ecosystem lock-in',
    description: 'High switching costs create an exceptionally wide economic moat.',
}) =>
    render(
        <StyledThemeProvider>
            <CriteriaCard {...props} />
        </StyledThemeProvider>,
    );

describe('CriteriaCard', () => {
    it('renders the supplied qualitative criterion', () => {
        renderCriteriaCard();

        expect(screen.getByTestId('criteria-card')).toBeVisible();
        expect(screen.getByTestId('criteria-card-label')).toHaveTextContent(
            'Durable Competitive Advantage',
        );
        expect(screen.getByTestId('criteria-card-title')).toHaveTextContent(
            'Strong moat via ecosystem lock-in',
        );
    });

    it('keeps long qualitative content available through public elements', () => {
        renderCriteriaCard({
            label: 'Long-Term Durable Competitive Advantage and Market Position',
            title: 'Ecosystem scale supports a self-reinforcing competitive moat',
            description: 'High switching costs coupled with integrated products and services support a durable economic advantage.',
        });

        expect(screen.getByTestId('criteria-card-label')).toHaveTextContent(
            'Long-Term Durable Competitive Advantage and Market Position',
        );
        expect(screen.getByTestId('criteria-card-description')).toHaveTextContent(
            'High switching costs coupled with integrated products and services support a durable economic advantage.',
        );
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
