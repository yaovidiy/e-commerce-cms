import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { getRequestEvent } from '$app/server';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	plugins: [
		username({
			minUsernameLength: 3,
			maxUsernameLength: 31,
			usernameValidator: (value) => /^[a-z0-9_-]+$/.test(value)
		})
	],
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'user',
				input: false
			},
			isAdmin: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: false
			},
			firstName: {
				type: 'string',
				required: false
			},
			lastName: {
				type: 'string',
				required: false
			},
			phone: {
				type: 'string',
				required: false
			}
		}
	}
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export type SessionValidationResult = {
	session: Session | null;
	user: User | null;
};

export function getUser() {
	const { locals } = getRequestEvent();

	const user = locals?.user || null;

	if (!user) {
		return null;
	}

	return user;
}

export function requireAdminUser() {
	const { locals } = getRequestEvent();

	const user = locals?.user || null;

	if (!user) {
		redirect(302, '/auth/login');
	}

	if (!user.isAdmin) {
		redirect(302, '/auth/login');
	}

	return user;
}
