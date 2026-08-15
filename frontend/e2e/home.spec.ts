// [ E2E > HOME ROUTE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
test('preserves the home route theme control and accessibility contract', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('header-theme-toggle')).toHaveAttribute('aria-checked', 'false');

    await page.getByTestId('header-theme-toggle').click();
    await expect(page.getByTestId('header-theme-toggle')).toHaveAttribute('aria-checked', 'true');

    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

    expect(results.violations).toEqual([]);
});
// 1.3. END ........................................................................................

// END FILE ##########################################################################################
