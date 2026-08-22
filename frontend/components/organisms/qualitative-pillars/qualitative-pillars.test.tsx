// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import ReduxProvider from '../../../redux/provider';
import { StyledThemeProvider } from '../../../theme';
import QualitativePillars from './qualitative-pillars';
import QualitativePillarsEmpty from './qualitative-pillars.empty';
import QualitativePillarsError from './qualitative-pillars.error';
import QualitativePillarsLoading from './qualitative-pillars.loading';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
const renderQualitativePillars = () =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <QualitativePillars
                    summary="Apple shows a constructive quantitative profile with strong profitability and a discounted valuation."
                    pillars={[
                        {
                            label: 'Capital Efficiency',
                            title: 'Returns and margins both screen strong',
                            description: 'Return on equity and profit margin both screen strong in the current dataset.',
                        },
                        {
                            label: 'Cash Generation',
                            title: 'Cash flow funds several years of operations',
                            description: 'Free cash flow covers more than 3 years of operating cash flow in the current dataset.',
                        },
                        {
                            label: 'Balance Sheet Discipline',
                            title: 'Leverage remains manageable rather than conservative',
                            description: 'Debt-to-equity sits in the medium range for the framework.',
                        },
                        {
                            label: 'Valuation Context',
                            title: 'Current price still shows a margin of safety',
                            description: 'Margin of safety remains positive under the current model.',
                        },
                    ]}
                />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('QualitativePillars', () => {
    it('renders the qualitative pillar title and every criterion', () => {
        renderQualitativePillars();

        expect(screen.getByTestId('qualitative-pillars')).toBeVisible();
        expect(screen.getByTestId('qualitative-pillars-title')).toHaveTextContent(
            'Buffett Framework Qualitative Pillars',
        );
        expect(screen.getByTestId('qualitative-pillars-summary')).toHaveTextContent(
            'Apple shows a constructive quantitative profile with strong profitability and a discounted valuation.',
        );
        expect(
            within(screen.getByTestId('qualitative-pillars-grid')).getAllByTestId(
                'criteria-card',
            ),
        ).toHaveLength(4);
    });

    it('announces the qualitative pillars loading state', () => {
        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <QualitativePillarsLoading />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('qualitative-pillars-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading qualitative pillars')).toBeVisible();
    });

    it('renders an empty state when no qualitative analysis is available', () => {
        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <QualitativePillarsEmpty />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('qualitative-pillars-empty')).toBeVisible();
        expect(screen.getByText('No qualitative analysis yet')).toBeVisible();
    });

    it('renders an error state and retry action when the qualitative analysis fails', async () => {
        const onRetry = vi.fn();
        const user = userEvent.setup();

        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <QualitativePillarsError onRetry={onRetry} />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('qualitative-pillars-error')).toHaveAttribute('role', 'alert');

        await user.click(screen.getByTestId('qualitative-pillars-error-retry'));

        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
