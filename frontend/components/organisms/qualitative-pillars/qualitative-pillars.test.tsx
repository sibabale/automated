// [ COMPONENTS > ORGANISMS > QUALITATIVE PILLARS ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import ReduxProvider from '../../../redux/provider';
import QualitativePillars from './qualitative-pillars';
import QualitativePillarsLoading from './qualitative-pillars.loading';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderQualitativePillars = () =>
    render(
        <ReduxProvider>
            <StyledThemeProvider>
                <QualitativePillars />
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
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
