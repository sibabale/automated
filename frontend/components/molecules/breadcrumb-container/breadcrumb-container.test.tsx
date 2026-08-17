// [ COMPONENTS > MOLECULES > BREADCRUMB CONTAINER ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { StyledThemeProvider } from '../../../theme';
import BreadcrumbContainer from './breadcrumb-container';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
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

    it('uses the supplied overview link when the active ticker is encoded in the route', () => {
        render(
            <StyledThemeProvider>
                <BreadcrumbContainer
                    companyName="Microsoft Corporation"
                    ticker="MSFT"
                    currentLabel="Profit Margin"
                    overviewHref="/?ticker=MSFT"
                />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('breadcrumb-container-overview')).toHaveAttribute(
            'href',
            '/?ticker=MSFT',
        );
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
