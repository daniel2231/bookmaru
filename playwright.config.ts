import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	},
	testDir: 'tests',
	use: {
		baseURL: 'http://localhost:4173',
		headless: true
	}
};

export default config;
