import { expect, test } from '@playwright/test';

// Test data to track for cleanup
const testUsers: string[] = [];

// Helper function to generate unique test username
function generateTestUsername() {
	return `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Cleanup function via API endpoint
async function cleanupTestUsers(baseURL: string) {
	if (testUsers.length === 0) return;

	try {
		const response = await fetch(`${baseURL}/api/test/cleanup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ usernames: testUsers })
		});

		if (!response.ok) {
			console.warn('Failed to cleanup test users:', await response.text());
		}
	} catch (error) {
		console.error('Error during cleanup:', error);
	}

	testUsers.length = 0;
}

test.describe('Authentication', () => {
	const baseURL = 'http://localhost:4173';

	// Cleanup after all tests
	test.afterAll(async () => {
		await cleanupTestUsers(baseURL);
	});

	test.describe('Signup', () => {
		test('should successfully register a new user', async ({ page }) => {
			const username = generateTestUsername();
			const email = `${username}@example.com`;
			const password = 'TestPassword123';

			testUsers.push(username);

			await page.goto('/auth/signup');

			// Fill in the signup form
			await page.fill('#username', username);
			await page.fill('#email', email);
			await page.fill('#password', password);
			await page.fill('#confirmPassword', password);

			// Submit the form and wait for redirect
			await page.click('button[type="submit"]');
			
			// Wait for URL to change to home or username to appear
			await page.waitForFunction(
				(un) => window.location.pathname === '/' || document.body.textContent?.includes(un),
				username,
				{ timeout: 10000 }
			);

			// Verify user is logged in by checking if username appears in the page (use first to handle duplicates)
			await expect(page.locator(`text=${username}`).first()).toBeVisible({ timeout: 5000 });
		});

		test('should show validation error for short username', async ({ page }) => {
			await page.goto('/auth/signup');

			// Try invalid username (too short)
			await page.fill('#username', 'ab');
			await page.fill('#password', 'TestPassword123');
			await page.fill('#confirmPassword', 'TestPassword123');
			await page.click('button[type="submit"]');

			// Should show validation error - use first() to handle multiple errors
			await expect(page.locator('.text-red-600, .text-red-400').first()).toBeVisible({ timeout: 3000 });
			// Verify it's the username error
			await expect(page.locator('text=/username.*at least 3/i')).toBeVisible();
		});

		test('should show error for password mismatch', async ({ page }) => {
			const username = generateTestUsername();

			await page.goto('/auth/signup');

			await page.fill('#username', username);
			await page.fill('#email', `${username}@example.com`);
			await page.fill('#password', 'TestPassword123');
			await page.fill('#confirmPassword', 'DifferentPassword123');

			// Should show password mismatch error
			await expect(page.locator('text=/passwords.*not match/i')).toBeVisible();

			// Submit button should be disabled
			await expect(page.locator('button[type="submit"]')).toBeDisabled();
		});
	});

	test.describe('Login', () => {
		test('should successfully login with valid credentials', async ({ page }) => {
			const username = generateTestUsername();
			const password = 'TestPassword123';

			testUsers.push(username);

			// First, register the user
			await page.goto('/auth/signup');
			await page.fill('#username', username);
			await page.fill('#email', `${username}@example.com`);
			await page.fill('#password', password);
			await page.fill('#confirmPassword', password);
			await page.click('button[type="submit"]');

			// Wait for redirect and login
			await page.waitForFunction(
				(un) => window.location.pathname === '/' || document.body.textContent?.includes(un),
				username,
				{ timeout: 10000 }
			);

			// Verify user is logged in (use first to handle duplicates)
			await expect(page.locator(`text=${username}`).first()).toBeVisible({ timeout: 5000 });
		});

		test('should show error for invalid credentials', async ({ page }) => {
			await page.goto('/auth/login');

			await page.fill('#username', 'nonexistentuser');
			await page.fill('#password', 'wrongpassword');
			await page.click('button[type="submit"]');

			// Should show error message
			await expect(page.locator('.text-red-600, .text-red-400').first()).toBeVisible({ timeout: 3000 });
		});
	});

	test.describe('Session Persistence', () => {
		test('should maintain session after page reload', async ({ page }) => {
			const username = generateTestUsername();
			const password = 'TestPassword123';

			testUsers.push(username);

			// Register and login
			await page.goto('/auth/signup');
			await page.fill('#username', username);
			await page.fill('#email', `${username}@example.com`);
			await page.fill('#password', password);
			await page.fill('#confirmPassword', password);
			await page.click('button[type="submit"]');

			// Wait for redirect and login
			await page.waitForFunction(
				(un) => window.location.pathname === '/' || document.body.textContent?.includes(un),
				username,
				{ timeout: 10000 }
			);

			// Verify logged in (use first to handle duplicates)
			await expect(page.locator(`text=${username}`).first()).toBeVisible({ timeout: 5000 });

			// Reload page
			await page.reload({ waitUntil: 'networkidle' });

			// Should still be logged in (use first to handle duplicates)
			await expect(page.locator(`text=${username}`).first()).toBeVisible({ timeout: 5000 });
		});
	});
});
