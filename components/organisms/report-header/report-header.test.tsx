// [ COMPONENTS > ORGANISMS > REPORT HEADER ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import ReportHeader from './report-header';
import ReportHeaderLoading from './report-header.loading';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderReportHeader = (
    props: ComponentProps<typeof ReportHeader> = {},
) =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <ReportHeader {...props} />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('ReportHeader', () => {
    it('renders the report identity and score summary', () => {
        renderReportHeader();

        expect(screen.getByTestId('report-header')).toBeVisible();
        expect(screen.getByTestId('report-header-title')).toHaveTextContent(
            'Apple Inc.',
        );
        expect(screen.getByTestId('report-header-ticker')).toHaveTextContent(
            'AAPL',
        );
        expect(screen.getByTestId('report-header-score-value')).toHaveTextContent(
            '8.2',
        );
    });

    it('renders supplied report details through its public interface', () => {
        renderReportHeader({
            companyName: 'Berkshire Hathaway',
            ticker: 'BRK.B',
            sector: 'Financial Services',
            industry: 'Insurance',
            valuation: '$488.76B',
            score: '9.1',
            scoreDescription: 'Exceptional Capital Allocation',
        });

        expect(screen.getByTestId('report-header-title')).toHaveTextContent(
            'Berkshire Hathaway',
        );
        expect(screen.getByTestId('report-header-sector')).toHaveTextContent(
            'Financial Services',
        );
        expect(screen.getByTestId('report-header-industry')).toHaveTextContent(
            'Insurance',
        );
        expect(screen.getByTestId('report-header-valuation')).toHaveTextContent(
            '$488.76B',
        );
        expect(screen.getByTestId('report-header-score-description')).toHaveTextContent(
            'Exceptional Capital Allocation',
        );
    });

    it('keeps long report details available through their individual public elements', () => {
        renderReportHeader({
            companyName: 'International Business Machines Corporation',
            ticker: 'IBM',
            sector: 'Information Technology Services and Consulting',
            industry: 'Enterprise Software and Infrastructure Solutions',
            valuation: '$289.45B',
            scoreDescription: 'Exceptional Long-Term Competitive Advantages',
        });

        expect(screen.getByTestId('report-header-title')).toHaveTextContent(
            'International Business Machines Corporation',
        );
        expect(screen.getByTestId('report-header-sector')).toHaveTextContent(
            'Information Technology Services and Consulting',
        );
        expect(screen.getByTestId('report-header-industry')).toHaveTextContent(
            'Enterprise Software and Infrastructure Solutions',
        );
        expect(screen.getByTestId('report-header-valuation')).toHaveTextContent(
            '$289.45B',
        );
        expect(screen.getByTestId('report-header-score-description')).toHaveTextContent(
            'Exceptional Long-Term Competitive Advantages',
        );
    });

    it('announces the report loading state', () => {
        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <ReportHeaderLoading />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('report-header-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading company report')).toBeVisible();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
