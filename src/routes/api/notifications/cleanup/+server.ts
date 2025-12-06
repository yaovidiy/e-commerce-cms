/**
 * Cleanup expired notifications and tasks
 */

import type { RequestHandler } from '@sveltejs/kit';
import { cleanupExpiredNotificationsAndTasks } from '$lib/server/services/notification-manager';

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	// Allow both authenticated users and cron jobs
	// In production, you might want to verify a cron secret

	try {
		await cleanupExpiredNotificationsAndTasks();
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Cleanup failed:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
