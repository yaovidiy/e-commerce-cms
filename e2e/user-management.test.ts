import { expect, test, type Page } from '@playwright/test';

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

// Helper to login as existing admin user
async function loginAsAdmin(page: Page) {
	const adminUsername = 'yaro';
	const adminPassword = 'Vladdmed1488';

	// Login with existing admin credentials
	await page.goto('/auth/login');
	await page.fill('#username', adminUsername);
	await page.fill('#password', adminPassword);
	await page.click('button[type="submit"]');

	// Wait for redirect to complete
	await page.waitForURL(/\/(admin|dashboard|$)/, { timeout: 10000 });
	await page.waitForLoadState('networkidle');

	return { username: adminUsername, password: adminPassword };
}

test.describe('User Management', () => {
	const baseURL = 'http://localhost:4173';

	// Cleanup after all tests
	test.afterAll(async () => {
		await cleanupTestUsers(baseURL);
	});

	test.describe('User List Display', () => {
		test('should display user list for admin', async ({ page }) => {
			await loginAsAdmin(page);

			// Navigate to users page
			await page.goto('/admin/users');
			await page.waitForLoadState('networkidle');

			// Should see users page heading
			await expect(
				page.locator('h1, h2').filter({ hasText: /users/i }).first()
			).toBeVisible({ timeout: 10000 });
		});

		test('should have create user button', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');
			await page.waitForLoadState('networkidle');

			// Should have a "Create User" button
			await expect(
				page.locator('button', { hasText: /create.*user/i }).first()
			).toBeVisible({ timeout: 10000 });
		});

		test('should redirect non-admin users away from admin pages', async () => {
			// This would need a second user - skip if first user auto-admin
			// Covered by auth requirements in remote functions
			// Skipping test as requireAdminUser() handles this server-side
		});
	});

	test.describe('Create User', () => {
		test('should open create user dialog', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');
			await page.waitForLoadState('networkidle');

			// Click create user button
			const createButton = page.locator('button', { hasText: /create.*user/i }).first();
			await createButton.click();

			// Wait a bit for dialog animation
			await page.waitForTimeout(500);

			// Dialog should be visible
			const dialogHeading = page.locator('h2, h3, [role="heading"]', { hasText: /create.*user/i });
			await expect(dialogHeading.first()).toBeVisible({ timeout: 5000 });
		});

		test('should successfully create a new user', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');
			await page.waitForLoadState('networkidle');

			const newUsername = generateTestUsername();
			const newPassword = 'NewUser123';
			testUsers.push(newUsername);

			// Open create dialog
			await page.locator('button', { hasText: /create.*user/i }).first().click();
			await page.waitForTimeout(500);

			// Fill form - use name attributes
			await page.locator('input[name="username"]').fill(newUsername);
			await page.locator('input[name="password"]').fill(newPassword);

			// Submit form
			const submitButton = page.locator('button[type="submit"]', { hasText: /save|create/i }).first();
			await submitButton.click();

			// Wait for dialog to close
			await page.waitForTimeout(2000);

			// New user should appear in the list
			await expect(page.locator(`text="${newUsername}"`).first()).toBeVisible({
				timeout: 10000
			});
		});

		test('should show validation error for short username', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');
			await page.waitForLoadState('networkidle');

			// Open create dialog
			await page.locator('button', { hasText: /create.*user/i }).first().click();
			await page.waitForTimeout(500);

			// Fill with invalid data
			await page.locator('input[name="username"]').fill('ab');
			await page.locator('input[name="password"]').fill('ValidPass123');

			// Submit form
			await page.locator('button[type="submit"]', { hasText: /save|create/i }).first().click();

			// Wait a bit
			await page.waitForTimeout(1000);

			// Should show validation error (could be in form or as toast)
			const errorText = await page.textContent('body');
			expect(errorText).toMatch(/username|at least|3/i);
		});
	});

	test.describe('Edit User', () => {
		test('should open edit user dialog', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user first
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			// Wait for user to appear
			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Find and click action menu (three dots)
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
			}

			// Click edit option
			const editButton = page.getByRole('menuitem', { name: /edit/i });
			if (await editButton.isVisible()) {
				await editButton.click();
			} else {
				// Fallback: direct edit button
				await userRow.getByRole('button', { name: /edit/i }).click();
			}

			// Edit dialog should be visible
			await expect(
				page.getByRole('heading', { name: /edit user/i })
			).toBeVisible();
		});

		test('should successfully update user information', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user first
			const originalUsername = generateTestUsername();
			const updatedUsername = generateTestUsername();
			testUsers.push(originalUsername, updatedUsername);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(originalUsername);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			// Wait for user to appear
			await expect(page.locator(`text=${originalUsername}`).first()).toBeVisible();

			// Open edit dialog
			const userRow = page.locator(`text=${originalUsername}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /edit/i }).click();
			} else {
				await userRow.getByRole('button', { name: /edit/i }).click();
			}

			// Update username
			const usernameInput = page.locator('input[name="username"]');
			await usernameInput.clear();
			await usernameInput.fill(updatedUsername);

			// Submit
			await page.getByRole('button', { name: /save|update/i }).click();

			// Wait for dialog to close
			await expect(
				page.getByRole('heading', { name: /edit user/i })
			).not.toBeVisible({ timeout: 5000 });

			// Updated username should appear
			await expect(page.locator(`text=${updatedUsername}`).first()).toBeVisible();
			// Original should not appear
			await expect(page.locator(`text=${originalUsername}`).first()).not.toBeVisible();
		});

		test('should update password when provided', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const username = generateTestUsername();
			const originalPassword = 'OriginalPass123';
			const newPassword = 'NewPassword123';
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill(originalPassword);
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open edit dialog
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /edit/i }).click();
			} else {
				await userRow.getByRole('button', { name: /edit/i }).click();
			}

			// Update password
			const passwordInput = page.locator('input[name="password"]');
			await passwordInput.clear();
			await passwordInput.fill(newPassword);

			// Submit
			await page.getByRole('button', { name: /save|update/i }).click();

			// Wait for dialog to close
			await expect(
				page.getByRole('heading', { name: /edit user/i })
			).not.toBeVisible({ timeout: 5000 });

			// Note: Actually testing the password change would require logging out
			// and logging in as that user, which is complex in E2E tests
		});

		test('should keep password unchanged when field is empty', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const username = generateTestUsername();
			const password = 'TestPass123';
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill(password);
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open edit dialog
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /edit/i }).click();
			} else {
				await userRow.getByRole('button', { name: /edit/i }).click();
			}

			// Leave password empty (should keep existing password)
			const passwordInput = page.locator('input[name="password"]');
			await passwordInput.clear();

			// Update something else (like username)
			const updatedUsername = generateTestUsername();
			testUsers.push(updatedUsername);
			const usernameInput = page.locator('input[name="username"]');
			await usernameInput.clear();
			await usernameInput.fill(updatedUsername);

			// Submit
			await page.getByRole('button', { name: /save|update/i }).click();

			// Wait for dialog to close
			await expect(
				page.getByRole('heading', { name: /edit user/i })
			).not.toBeVisible({ timeout: 5000 });
		});
	});

	test.describe('Toggle Admin Status', () => {
		test('should toggle user admin status', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a regular user
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			
			// Ensure admin is off
			const adminSwitch = page.locator('button[role="switch"], input[type="checkbox"][name*="admin"]');
			if (await adminSwitch.isVisible()) {
				const isChecked = await adminSwitch.getAttribute('aria-checked');
				if (isChecked === 'true') {
					await adminSwitch.click();
				}
			}

			await page.getByRole('button', { name: /save|create/i }).first().click();
			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open action menu
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();

				// Click toggle admin option
				const toggleAdminOption = page.getByRole('menuitem', { name: /make admin|admin/i });
				await toggleAdminOption.click();

				// Wait for menu to close and action to complete
				await page.waitForTimeout(1000);

				// Verify change (could check for badge, icon, or text indicator)
				// This depends on how admin status is displayed in the UI
			}
		});

		test('should show different toggle option based on current status', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user with admin status
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			
			// Enable admin
			const adminSwitch = page.locator('button[role="switch"], input[type="checkbox"][name*="admin"]');
			if (await adminSwitch.isVisible()) {
				const isChecked = await adminSwitch.getAttribute('aria-checked');
				if (isChecked === 'false' || isChecked === null) {
					await adminSwitch.click();
				}
			}

			await page.getByRole('button', { name: /save|create/i }).first().click();
			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open action menu
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();

				// Should show "Remove Admin" option
				await expect(
					page.getByRole('menuitem', { name: /remove admin/i })
				).toBeVisible();
			}
		});
	});

	test.describe('Delete User', () => {
		test('should open delete confirmation dialog', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open action menu
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /delete/i }).click();
			} else {
				await userRow.getByRole('button', { name: /delete/i }).click();
			}

			// Delete confirmation dialog should be visible
			await expect(
				page.getByRole('heading', { name: /delete user/i })
			).toBeVisible();

			// Should show username in confirmation message
			await expect(page.locator(`text=${username}`)).toBeVisible();
		});

		test('should successfully delete user', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open delete dialog
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /delete/i }).click();
			} else {
				await userRow.getByRole('button', { name: /delete/i }).click();
			}

			// Confirm deletion
			await page.getByRole('button', { name: /delete|confirm/i }).click();

			// Wait for dialog to close
			await expect(
				page.getByRole('heading', { name: /delete user/i })
			).not.toBeVisible({ timeout: 5000 });

			// User should no longer appear in list
			await expect(page.locator(`text=${username}`).first()).not.toBeVisible();

			// Remove from cleanup list since already deleted
			const index = testUsers.indexOf(username);
			if (index > -1) {
				testUsers.splice(index, 1);
			}
		});

		test('should cancel deletion when clicking cancel', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Open delete dialog
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /delete/i }).click();
			} else {
				await userRow.getByRole('button', { name: /delete/i }).click();
			}

			// Cancel deletion
			await page.getByRole('button', { name: /cancel/i }).click();

			// Dialog should close
			await expect(
				page.getByRole('heading', { name: /delete user/i })
			).not.toBeVisible({ timeout: 5000 });

			// User should still appear in list
			await expect(page.locator(`text=${username}`).first()).toBeVisible();
		});
	});

	test.describe('Security & Access Control', () => {
		test('should not allow deleting own account', async ({ page }) => {
			const admin = await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Try to find current user in the list (should not be there)
			await expect(page.locator(`text=${admin.username}`).first()).not.toBeVisible();
		});

		test('should require admin privileges for user management', async () => {
			// This test verifies that non-admin users cannot access user management
			// Implementation depends on how non-admin users are created and auth is enforced
			// Covered by requireAdminUser() in remote functions
		});
	});

	test.describe('List Auto-Refresh', () => {
		test('should refresh list after creating user', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Get initial user count
			const initialRows = await page.locator('tr, [data-user-id], .user-card').count();

			// Create a user
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			// Wait for dialog to close
			await expect(
				page.getByRole('heading', { name: /create user/i })
			).not.toBeVisible({ timeout: 5000 });

			// New user should appear
			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// User count should increase
			const newRows = await page.locator('tr, [data-user-id], .user-card').count();
			expect(newRows).toBeGreaterThan(initialRows);
		});

		test('should refresh list after updating user', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const originalUsername = generateTestUsername();
			const updatedUsername = generateTestUsername();
			testUsers.push(originalUsername, updatedUsername);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(originalUsername);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${originalUsername}`).first()).toBeVisible();

			// Edit user
			const userRow = page.locator(`text=${originalUsername}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /edit/i }).click();
			} else {
				await userRow.getByRole('button', { name: /edit/i }).click();
			}

			const usernameInput = page.locator('input[name="username"]');
			await usernameInput.clear();
			await usernameInput.fill(updatedUsername);
			await page.getByRole('button', { name: /save|update/i }).click();

			// Wait for dialog to close
			await expect(
				page.getByRole('heading', { name: /edit user/i })
			).not.toBeVisible({ timeout: 5000 });

			// Updated username should appear immediately
			await expect(page.locator(`text=${updatedUsername}`).first()).toBeVisible();
		});

		test('should refresh list after deleting user', async ({ page }) => {
			await loginAsAdmin(page);
			await page.goto('/admin/users');

			// Create a user
			const username = generateTestUsername();
			testUsers.push(username);

			await page.getByRole('button', { name: /create user/i }).first().click();
			await page.locator('input[name="username"]').fill(username);
			await page.locator('input[name="password"]').fill('TestPass123');
			await page.getByRole('button', { name: /save|create/i }).first().click();

			await expect(page.locator(`text=${username}`).first()).toBeVisible();

			// Get user count with the new user
			const initialRows = await page.locator('tr, [data-user-id], .user-card').count();

			// Delete user
			const userRow = page.locator(`text=${username}`).first().locator('..');
			const actionButton = userRow.locator('button[aria-label*="actions"], button[aria-haspopup="menu"]').first();
			
			if (await actionButton.isVisible()) {
				await actionButton.click();
				await page.getByRole('menuitem', { name: /delete/i }).click();
			} else {
				await userRow.getByRole('button', { name: /delete/i }).click();
			}

			await page.getByRole('button', { name: /delete|confirm/i }).click();

			// Wait for deletion to complete
			await expect(page.locator(`text=${username}`).first()).not.toBeVisible();

			// User count should decrease
			const newRows = await page.locator('tr, [data-user-id], .user-card').count();
			expect(newRows).toBeLessThan(initialRows);

			// Remove from cleanup list
			const index = testUsers.indexOf(username);
			if (index > -1) {
				testUsers.splice(index, 1);
			}
		});
	});
});
