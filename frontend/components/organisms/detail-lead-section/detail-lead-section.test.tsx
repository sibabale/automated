// [ COMPONENTS > ORGANISMS > DETAIL LEAD SECTION ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import DetailLeadSection from './detail-lead-section';
import DetailLeadSectionLoading from './detail-lead-section.loading';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderDetailLeadSection = (props = {
    companyName: 'Apple Inc.',
    ticker: 'AAPL',
    title: 'Return on Equity',
    value: '21.3%',
    description: 'Buffett Target: > 15%',
}) =>
    render(
        <StyledThemeProvider>
            <DetailLeadSection {...props} />
        </StyledThemeProvider>,
    );

describe('DetailLeadSection', () => {
    it('renders the supplied metric context and overview path', () => {
        renderDetailLeadSection();

        expect(screen.getByTestId('detail-lead-section')).toBeVisible();
        expect(screen.getByTestId('detail-lead-section-company')).toHaveTextContent('Apple Inc. · AAPL');
        expect(screen.getByTestId('detail-lead-section-title')).toHaveTextContent('Return on Equity');
        expect(screen.getByTestId('detail-lead-section-value')).toHaveTextContent('21.3%');
        expect(screen.getByTestId('detail-lead-section-back')).toHaveAttribute('href', '/');
    });

    it('keeps long dynamic metric copy available', () => {
        renderDetailLeadSection({
            companyName: 'Apple Incorporated International',
            ticker: 'AAPL',
            title: 'Long-Term Shareholder Return on Common Equity',
            value: '$1,284.72B',
            description: 'Consistent expansion through challenging market conditions',
        });

        expect(screen.getByTestId('detail-lead-section-title')).toHaveTextContent(
            'Long-Term Shareholder Return on Common Equity',
        );
        expect(screen.getByTestId('detail-lead-section-description')).toHaveTextContent(
            'Consistent expansion through challenging market conditions',
        );
    });

    it('announces metric detail loading', () => {
        render(
            <StyledThemeProvider>
                <DetailLeadSectionLoading />
            </StyledThemeProvider>,
        );

        expect(screen.getByTestId('detail-lead-section-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading metric details')).toBeVisible();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
