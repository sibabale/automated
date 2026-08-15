// [ COMPONENTS > MOLECULES > METRIC CARD ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import MetricCard from './metric-card';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderMetricCard = (props = {
    href: '/details/return-on-equity',
    label: 'Return on Equity',
    value: '21.3%',
    description: 'Buffett Target: > 15%',
}) =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <MetricCard {...props} />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('MetricCard', () => {
    it('renders the supplied metric details', () => {
        renderMetricCard();

        expect(screen.getByTestId('metric-card')).toBeVisible();
        expect(screen.getByTestId('metric-card')).toHaveAttribute(
            'href',
            '/details/return-on-equity',
        );
        expect(screen.getByTestId('metric-card-label')).toHaveTextContent(
            'Return on Equity',
        );
        expect(screen.getByTestId('metric-card-value')).toHaveTextContent(
            '21.3%',
        );
        expect(screen.getByTestId('metric-card-description')).toHaveTextContent(
            'Buffett Target: > 15%',
        );
    });

    it('keeps long metric content available through its public elements', () => {
        renderMetricCard({
            href: '/details/long-term-shareholder-return',
            label: 'Long-Term Shareholder Return on Common Equity',
            value: '$1,284.72B',
            description: 'Consistent expansion through challenging market conditions',
        });

        expect(screen.getByTestId('metric-card-label')).toHaveTextContent(
            'Long-Term Shareholder Return on Common Equity',
        );
        expect(screen.getByTestId('metric-card-value')).toHaveTextContent(
            '$1,284.72B',
        );
        expect(screen.getByTestId('metric-card-description')).toHaveTextContent(
            'Consistent expansion through challenging market conditions',
        );
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
