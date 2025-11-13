import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		timeout: 120000, // 2 minutes for build
		reuseExistingServer: !process.env.CI
	},

	testDir: 'e2e',
	timeout: 30000, // 30 seconds per test
	expect: {
		timeout: 10000 // 10 seconds for assertions
	}
});
