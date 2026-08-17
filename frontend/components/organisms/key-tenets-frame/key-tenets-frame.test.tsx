// [ COMPONENTS > ORGANISMS > KEY TENETS FRAME ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import KeyTenetsFrame from './key-tenets-frame';
import ReduxProvider from '../../../redux/provider';
import { StyledThemeProvider } from '../../../theme';
import KeyTenetsFrameLoading from './key-tenets-frame.loading';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
const renderKeyTenetsFrame = (
    props: ComponentProps<typeof KeyTenetsFrame> = {},
) =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <KeyTenetsFrame {...props} />
            </StyledThemeProvider>
        </ReduxProvider>,
    );

describe('KeyTenetsFrame', () => {
    it('renders the metric frame title and all supplied metrics', () => {
        renderKeyTenetsFrame();

        expect(screen.getByTestId('key-tenets-frame')).toBeVisible();
        expect(screen.getByTestId('key-tenets-frame-title')).toHaveTextContent(
            'Key Tenets & Ratios',
        );
        expect(
            within(screen.getByTestId('key-tenets-frame-metrics')).getAllByTestId(
                'metric-card',
            ),
        ).toHaveLength(5);
        expect(screen.getAllByTestId('metric-card')[0]).toHaveAttribute(
            'href',
            '/details/return-on-equity?ticker=AAPL',
        );
    });

    it('renders supplied metric values through its public card interface', () => {
        renderKeyTenetsFrame({
            activeTicker: 'MSFT',
            metrics: [
                {
                    slug: 'return-on-equity',
                    label: 'Return on Equity',
                    value: '18.2%',
                    description: 'Durable capital returns',
                },
            ],
        });

        expect(
            within(screen.getByTestId('key-tenets-frame-metrics')).getAllByTestId(
                'metric-card',
            ),
        ).toHaveLength(1);
        expect(screen.getByTestId('metric-card')).toHaveAttribute(
            'href',
            '/details/return-on-equity?ticker=MSFT',
        );
        expect(screen.getByText('18.2%')).toBeVisible();
        expect(screen.getByText('Durable capital returns')).toBeVisible();
    });

    it('announces the key tenets loading state', () => {
        render(
            <ReduxProvider>
                <StyledThemeProvider>
                    <KeyTenetsFrameLoading />
                </StyledThemeProvider>
            </ReduxProvider>,
        );

        expect(screen.getByTestId('key-tenets-frame-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading key tenets and ratios')).toBeVisible();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
