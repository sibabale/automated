// [ E2E > METRIC DETAILS ROUTE ] #####################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
test('exposes metric detail loading with accessible route context', async ({ page }) => {
    await page.goto('/details/return-on-equity');

    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.getByTestId('detail-lead-section-loading')).toHaveAttribute('role', 'status');

    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

    expect(results.violations).toEqual([]);
});
// 1.3. END ........................................................................................

// END FILE ##########################################################################################
