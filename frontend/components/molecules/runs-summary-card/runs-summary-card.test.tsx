// [ COMPONENTS > MOLECULES > RUNS SUMMARY CARD ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import RunsSummaryCard from './runs-summary-card';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe('RunsSummaryCard', () => {
    it('renders the run summary content', () => {
        render(
            <StyledThemeProvider>
                <RunsSummaryCard label="Total runs" value="226" description="Latest processed 2026-08-19" />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('runs-summary-card')).toBeVisible();
        expect(screen.getByText('Total runs')).toBeVisible();
        expect(screen.getByText('226')).toBeVisible();
        expect(screen.getByText('Latest processed 2026-08-19')).toBeVisible();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
