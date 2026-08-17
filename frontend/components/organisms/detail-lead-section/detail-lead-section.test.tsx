// [ COMPONENTS > ORGANISMS > DETAIL LEAD SECTION ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { StyledThemeProvider } from '../../../theme';
import DetailLeadSection from './detail-lead-section';
import DetailLeadSectionLoading from './detail-lead-section.loading';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
type DetailLeadSectionProps = React.ComponentProps<typeof DetailLeadSection>;

const renderDetailLeadSection = (props: DetailLeadSectionProps = {
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

    it('shows a headline skeleton while the metric value is loading, keeping static copy visible', () => {
        renderDetailLeadSection({
            companyName: 'Apple Inc.',
            ticker: 'AAPL',
            title: 'Return on Equity',
            value: '21.3%',
            description: 'Buffett Target: > 15%',
            isValueLoading: true,
        });

        expect(screen.getByTestId('detail-lead-section-title')).toHaveTextContent('Return on Equity');
        expect(screen.getByTestId('detail-lead-section-value-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading current return on equity')).toBeVisible();
        expect(screen.queryByTestId('detail-lead-section-value')).toBeNull();
    });

    it('uses the supplied metric title in the loading announcement', () => {
        renderDetailLeadSection({
            companyName: 'Apple Inc.',
            ticker: 'AAPL',
            title: 'Profit Margin',
            value: '25.3%',
            description: 'Premium earnings power',
            isValueLoading: true,
        });

        expect(screen.getByLabelText('Loading current profit margin')).toBeVisible();
    });

    it('uses the supplied overview link when returning to the active company overview', () => {
        renderDetailLeadSection({
            companyName: 'Microsoft Corporation',
            ticker: 'MSFT',
            title: 'Profit Margin',
            value: '35.0%',
            description: 'Premium earnings power',
            overviewHref: '/?ticker=MSFT',
        });

        expect(screen.getByTestId('detail-lead-section-back')).toHaveAttribute(
            'href',
            '/?ticker=MSFT',
        );
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
