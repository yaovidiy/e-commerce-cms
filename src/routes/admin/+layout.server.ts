import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	// Check if user is admin
	if (!locals.user.isAdmin) {
		redirect(302, '/');
	}

	// Return user data for use in layout/pages
	return {
		user: locals.user
	};
};
