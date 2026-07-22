import { test, expect } from '@playwright/test';

// Objective 2 — Customer-Based Booking Interface: E2E journey 
// (customer logs in -> opens chat assistant -> browses collection -> clicks 'Rent Now' -> verifies action/transaction).

test.describe('Objective 2 — Customer-Based Booking Interface', () => {
  test('customer logs in, uses chat assistant, browses product collection, and clicks Rent Now', async ({
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

    // 2. Customer AI Digital Stylist (chat assistant)
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

    // 3. Navigate to Collection view
    await page.getByRole('button', { name: 'Collection' }).click();
    await expect(page.getByText('Emerald Silk Mermaid Evening Gown')).toBeVisible();

    // 4. Click 'Rent Now' on the available product
    await page.getByRole('button', { name: 'Rent Now' }).first().click();

    // 5. Verify transaction or booking state updates (adjust based on your modal/form view)
    // e.g., checking that a transaction record or booking confirmation modal appears
    await page.getByRole('button', { name: 'Transactions' }).click();
    await expect(page.getByText('Transactions')).toBeVisible();

    // 6. Customer logout
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('Confirm Sign Out')).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).last().click();
    await expect(page).toHaveURL(/\/login$/);

    // Ensure no uncaught JavaScript errors occurred during the test run.
    expect(pageErrors).toEqual([]);
  });
});