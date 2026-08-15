// [ COMPONENTS > ORGANISMS > FORMULA SECTION ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import FormulaSectionEmpty from './formula-section.empty';
import FormulaSectionError from './formula-section.error';
import FormulaSectionLoading from './formula-section.loading';
import FormulaSection from './formula-section';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const formulaProps = {
    title: 'How ROE Is Calculated',
    standardFormulaLabel: 'Standard Formula',
    actualsLabel: 'AAPL TTM Actuals',
    numeratorLabel: 'Net Income',
    denominatorLabel: "Shareholders' Equity",
    numeratorValue: '$96.99B',
    denominatorValue: '$62.15B',
    factor: '× 100',
    result: '21.3%',
    footnote: 'Based on TTM figures from SEC filings',
};

const renderFormulaSection = (props = formulaProps) =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <FormulaSection {...props} />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('FormulaSection', () => {
    it('renders standard and company calculation inputs', () => {
        renderFormulaSection();

        expect(screen.getByTestId('formula-section')).toBeVisible();
        expect(screen.getByTestId('formula-section-title')).toHaveTextContent('How ROE Is Calculated');
        expect(screen.getByTestId('formula-section-standard-formula')).toHaveTextContent('ROE');
        expect(screen.getByText('Net Income')).toBeInTheDocument();
        expect(screen.getByText("Shareholders' Equity")).toBeInTheDocument();
        expect(screen.getByTestId('formula-section-result')).toHaveTextContent('21.3%');
    });

    it('keeps long dynamic calculation copy available', () => {
        renderFormulaSection({
            ...formulaProps,
            numeratorLabel: 'Net Income Attributable to Common Shareholders',
            footnote: 'Based on trailing twelve month figures from the company annual filing.',
        });

        expect(screen.getByTestId('formula-section-standard-formula')).toHaveTextContent(
            'Net Income Attributable to Common Shareholders',
        );
        expect(screen.getByTestId('formula-section-footnote')).toHaveTextContent(
            'Based on trailing twelve month figures from the company annual filing.',
        );
    });

    it('announces the calculation loading state', () => {
        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <FormulaSectionLoading />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('formula-section-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading calculation logic')).toBeVisible();
    });

    it('renders the supplied empty state copy', () => {
        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <FormulaSectionEmpty />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('formula-section-empty')).toHaveTextContent('No data available');
    });

    it('announces formula errors and exposes a retry action', () => {
        const onRetry = vi.fn();

        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <FormulaSectionError onRetry={onRetry} />
                </StyledThemeProvider>
            </ReduxProvider>,
        );
        fireEvent.click(screen.getByTestId('formula-section-error-retry'));

        expect(screen.getByTestId('formula-section-error')).toHaveAttribute('role', 'alert');
        expect(onRetry).toHaveBeenCalledOnce();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
