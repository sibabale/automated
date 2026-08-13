// [ COMPONENTS > ORGANISMS > CONSOLIDATION SUMMARY ] ################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ConsolidationSummary from './consolidation-summary';
import ConsolidationSummaryLoading from './consolidation-summary.loading';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('ConsolidationSummary', () => {
    const props = {
        title: 'Consolidation Summary',
        values: ['26.1%', '23.7%', '19.8%', '16.4%'],
        denominator: '4 (Adjusted for Weight)',
        result: '21.3%',
        note: 'Weighted average with recency bias.',
    };

    it('renders the weighted analysis summary', () => {
        render(<StyledThemeProvider><ConsolidationSummary {...props} /></StyledThemeProvider>);

        expect(screen.getByTestId('consolidation-summary-title')).toHaveTextContent('Consolidation Summary');
        expect(screen.getByTestId('consolidation-summary-mobile-calculation')).toHaveTextContent('21.3%');
        expect(screen.getByTestId('consolidation-summary-note')).toHaveTextContent(props.note);
    });

    it('announces consolidation loading', () => {
        render(
            <StyledThemeProvider>
                <ConsolidationSummaryLoading />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('consolidation-summary-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading consolidation summary')).toBeVisible();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
