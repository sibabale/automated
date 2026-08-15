// [ COMPONENTS > MOLECULES > HORIZON CARD ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import HorizonCard from './horizon-card';
import HorizonCardEmpty from './horizon-card.empty';
import HorizonCardError from './horizon-card.error';
import { StyledThemeProvider } from '../../../theme';
import HorizonCardLoading from './horizon-card.loading';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
const horizonProps = {
    label: 'Short Term',
    range: '1–3 Years',
    value: '26.1%',
    breakdown: [
        { period: '2024', value: '28.3%' },
        { period: '2023', value: '25.8%' },
    ],
    insight: 'Strong short-term returns driven by services growth',
    trend: 'up' as const,
};

const renderHorizonCard = (props = horizonProps) =>
    render(
        <StyledThemeProvider>
            <HorizonCard {...props} />
        </StyledThemeProvider>,
    );

describe('HorizonCard', () => {
    it('renders the supplied horizon result and yearly breakdown', () => {
        renderHorizonCard();

        expect(screen.getByTestId('horizon-card-title')).toHaveTextContent('Short Term');
        expect(screen.getByTestId('horizon-card-value')).toHaveTextContent('26.1%');
        expect(within(screen.getByTestId('horizon-card-breakdown')).getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByTestId('horizon-card-insight')).toHaveTextContent(
            'Strong short-term returns driven by services growth',
        );
    });

    it('keeps long insights available', () => {
        renderHorizonCard({
            ...horizonProps,
            insight: 'Strong performance through multiple economic cycles and changing competitive conditions.',
        });

        expect(screen.getByTestId('horizon-card-insight')).toHaveTextContent(
            'Strong performance through multiple economic cycles and changing competitive conditions.',
        );
    });

    it('uses the supplied trend badge', () => {
        const { rerender } = renderHorizonCard();

        expect(screen.getByTestId('trend-badge')).toHaveAttribute('data-variant', 'up');

        rerender(
            <StyledThemeProvider>
                <HorizonCard {...horizonProps} trend="down" />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('trend-badge')).toHaveAttribute('data-variant', 'down');
    });

    it('announces time horizon loading', () => {
        render(
            <StyledThemeProvider>
                <HorizonCardLoading />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('horizon-card-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading time horizon analysis')).toBeVisible();
    });
});

describe('HorizonCardEmpty', () => {
    it('explains that there is no analysis to display', () => {
        render(
            <StyledThemeProvider>
                <HorizonCardEmpty />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('horizon-card-empty')).toBeVisible();
        expect(screen.getByTestId('horizon-card-empty')).toHaveTextContent('No return on equity to show');
    });
});

describe('HorizonCardError', () => {
    it('announces the failure to assistive technology', () => {
        render(
            <StyledThemeProvider>
                <HorizonCardError message="The analysis could not be loaded." />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('horizon-card-error')).toHaveAttribute('role', 'alert');
        expect(screen.getByTestId('horizon-card-error')).toHaveTextContent('The analysis could not be loaded.');
    });

    it('offers a retry action only when a retry handler is supplied', () => {
        const onRetry = vi.fn();

        const { rerender } = render(
            <StyledThemeProvider>
                <HorizonCardError />
            </StyledThemeProvider>,
        );

        expect(screen.queryByTestId('horizon-card-error-retry')).toBeNull();

        rerender(
            <StyledThemeProvider>
                <HorizonCardError onRetry={onRetry} />
            </StyledThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('horizon-card-error-retry'));

        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
