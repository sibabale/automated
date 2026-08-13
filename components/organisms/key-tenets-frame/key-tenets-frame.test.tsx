// [ COMPONENTS > ORGANISMS > KEY TENETS FRAME ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import KeyTenetsFrame from './key-tenets-frame';
import KeyTenetsFrameLoading from './key-tenets-frame.loading';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderKeyTenetsFrame = () =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <KeyTenetsFrame />
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
// 1.3. END ........................................................................................

// END FILE ########################################################################################
