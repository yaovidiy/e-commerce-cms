import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Require authentication for dashboard and all sub-routes
	if (!locals.user) {
		// Redirect to login with return URL
		redirect(303, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	return {
		user: locals.user
	};
};
