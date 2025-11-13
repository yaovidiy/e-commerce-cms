import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Allow cleanup in development and test environments
// This endpoint should be removed or protected in production
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { usernames } = await request.json();

		if (!Array.isArray(usernames)) {
			return json({ error: 'usernames must be an array' }, { status: 400 });
		}

		let deletedCount = 0;

		for (const username of usernames) {
			const [user] = await db
				.select()
				.from(tables.user)
				.where(eq(tables.user.username, username));

			if (user) {
				// Delete user sessions first
				await db.delete(tables.session).where(eq(tables.session.userId, user.id));
				// Delete user blogs
				await db.delete(tables.blog).where(eq(tables.blog.authorId, user.id));
				// Delete user
				await db.delete(tables.user).where(eq(tables.user.id, user.id));
				deletedCount++;
			}
		}

		return json({ success: true, deletedCount });
	} catch (error) {
		console.error('Cleanup error:', error);
		return json({ error: 'Failed to cleanup users' }, { status: 500 });
	}
};
