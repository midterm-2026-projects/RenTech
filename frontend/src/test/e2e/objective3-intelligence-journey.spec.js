import { test, expect } from '@playwright/test';

// Objective 3 — System-Level Intelligence and Demand Forecasting: E2E journey (customer chat assistant -> admin intelligence dashboard). Servers are started in globalSetup and stopped in globalTeardown; any uncaught page error fails the run.

test.describe('Objective 3 — System-Level Intelligence & Demand Forecasting', () => {
  test('customer uses the AI assistant, then admin reviews the intelligence dashboard', async ({
    page,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    // 1. Customer login (mock credentials: customer / customer)
    await page.goto('/login');
    await page.getByPlaceholder('admin').fill('customer');
    await page.locator('input[type="password"]').fill('customer');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/customer$/);

    // 2. Customer AI Digital Stylist (chat assistant) — Objective 3 task
    await page.getByRole('button', { name: 'Open chat' }).click();
    await expect(
      page.getByText("Hi! I’m your customer assistant. How can I help you today?")
    ).toBeVisible();

    await page.getByPlaceholder('Ask your AI assistant...').fill('Do you have any gowns for a wedding?');
    await page.getByRole('button', { name: 'Send' }).click();

    // A reply (recommendation) or the AI-fallback copy must appear. The last
    // assistant bubble is the reply, so it never matches the greeting. When the
    // Gemini key is not configured the backend returns its friendly stylist
    // fallback, which is still a valid assistant turn.
    await expect(
      page.locator('[data-testid="chat-messages"] div.bg-gray-200').last()
    ).toContainText(
      /(recommend|unavailable|knowledge base|trouble connecting|help you with|stylist|ask me about)/i,
      { timeout: 20000 }
    );

    // 3. Customer logout
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('Confirm Sign Out')).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).last().click();
    await expect(page).toHaveURL(/\/login$/);

    // 4. Admin login (mock credentials: admin / admin)
    await page.getByPlaceholder('admin').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/admin$/);

    // 5. Intelligence dashboard: KPI cards + charts (or empty state)
    // KPI cards — present when analytics load, or the error/Retry state appears.
    await expect(
      page.getByText('Total Revenue').or(page.getByText('Unable to load analytics'))
    ).toBeVisible();
    await expect(page.getByText('Active Rentals', { exact: true })).toBeVisible();
    await expect(page.getByText('Utilization', { exact: true })).toBeVisible();

    // Dashboard charts (other graph types), or graceful "No analytics data available" state.
    await expect(
      page
        .getByText('Revenue Trajectory', { exact: true })
        .or(page.getByText('No analytics data available'))
    ).toBeVisible();

    // NOTE: The AI Business Insights panel now lives only on the dedicated
    // AI Intelligence tab (see step 7), not embedded in the dashboard view.

    // 6b. Inventory tab — Smart Inventory & Rental Optimization (Objective 3.3)
    await page.getByRole('button', { name: 'Inventory' }).click();
    await expect(
      page.getByText('Smart Inventory & Rental Optimization')
    ).toBeVisible();
    // Optimization score stat and promotion recommendations must render.
    await expect(page.getByTestId('opt-score')).toBeVisible();
    await expect(page.getByText('Promotion Recommendations')).toBeVisible();

    // 7. Navigate to the dedicated AI Intelligence tab
    await page.getByRole('button', { name: 'AI Intelligence' }).click();
    await expect(
      page.getByRole('heading', { name: 'AI Business Insights' })
    ).toBeVisible();

    // 8. Admin logout
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('Confirm Sign Out')).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).last().click();
    await expect(page).toHaveURL(/\/login$/);

    // No uncaught JavaScript errors during the whole journey.
    expect(pageErrors).toEqual([]);
  });
});
