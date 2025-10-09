import { test, expect } from '@playwright/test';

test('submit page shows form and requires name', async ({ page }) => {
	await page.goto('/submit');
	const name = page.getByLabel(/이름|Name/i);
	await expect(name).toBeVisible();
	// Trigger native required validation by attempting to submit
	await page.getByRole('button', { name: /(검토 요청|Submit)/i }).click();
	await expect(name).toBeFocused();
});
