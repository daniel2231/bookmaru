import { test, expect } from '@playwright/test';

test('home loads and shows title & add location link', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/책마루|Bookmaru/i);
	await expect(page.getByRole('link', { name: /(Add Location|장소 추가하기)/i })).toBeVisible();
});
