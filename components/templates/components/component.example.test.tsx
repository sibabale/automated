// [ COMPONENTS > MOLECULES > COUNTER ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { StyledThemeProvider } from '../../../theme';
import Component from './component.example';
import ComponentEmpty from './component.empty.example';
import ComponentError from './component.error.example';
import ComponentLoading from './component.loading.example';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
const renderState = (component: React.ReactNode) =>
    render(
        <StyledThemeProvider>
            {component}
        </StyledThemeProvider>,
    );

describe('Component state examples', () => {
    it('renders the primary component', () => {
        renderState(<Component title="Counter Component" />);

        expect(screen.getByTestId('component-title')).toHaveTextContent('Counter Component');
    });

    it('announces loading content', () => {
        renderState(<ComponentLoading />);

        expect(screen.getByTestId('component-loading')).toHaveAttribute('role', 'status');
        expect(screen.getByLabelText('Loading counter content')).toBeVisible();
    });

    it('renders optional empty-state actions', () => {
        const onAction = vi.fn();

        renderState(<ComponentEmpty actionLabel="Create entry" onAction={onAction} />);
        fireEvent.click(screen.getByTestId('component-empty-action'));

        expect(onAction).toHaveBeenCalledOnce();
    });

    it('announces errors and exposes retry callbacks', () => {
        const onRetry = vi.fn();

        renderState(<ComponentError onRetry={onRetry} />);
        fireEvent.click(screen.getByTestId('component-error-retry'));

        expect(screen.getByTestId('component-error')).toHaveAttribute('role', 'alert');
        expect(onRetry).toHaveBeenCalledOnce();
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
