// [ COMPONENTS > MOLECULES > BREADCRUMB CONTAINER ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import BreadcrumbContainer from './breadcrumb-container';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderBreadcrumbContainer = (currentLabel = 'Return on Equity') =>
    render(
        <StyledThemeProvider>
            <BreadcrumbContainer
                companyName="Apple Inc."
                ticker="AAPL"
                currentLabel={currentLabel}
            />
        </StyledThemeProvider>,
    );

describe('BreadcrumbContainer', () => {
    it('renders the overview path and current metric', () => {
        renderBreadcrumbContainer();

        expect(screen.getByTestId('breadcrumb-container')).toBeVisible();
        expect(screen.getByTestId('breadcrumb-container-overview')).toHaveAttribute('href', '/');
        expect(screen.getByTestId('breadcrumb-container-company')).toHaveTextContent('Apple Inc. (AAPL)');
        expect(screen.getByTestId('breadcrumb-container-current')).toHaveTextContent('Return on Equity');
    });

    it('keeps a long current metric label available', () => {
        renderBreadcrumbContainer('Long-Term Shareholder Return on Common Equity');

        expect(screen.getByTestId('breadcrumb-container-current')).toHaveTextContent(
            'Long-Term Shareholder Return on Common Equity',
        );
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
