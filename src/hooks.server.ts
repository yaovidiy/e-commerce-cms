import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { building } from '$app/environment';

const handleParaglide: Handle = i18n.handle();

// Gracefully handle PostHog shutdown timeout and unhandled rejections during build
if (process.env.NODE_ENV === 'production') {
	process.on('beforeExit', () => {
		// Allow PostHog or other background tasks to shut down without blocking build
		process.exit(0);
	});

	process.on('unhandledRejection', (reason) => {
		// Specifically catch PostHog timeout rejection to prevent build failure
		if (reason instanceof Error && reason.message.includes('PostHog')) {
			console.warn('Caught PostHog unhandled rejection during shutdown:', reason.message);
			process.exit(0);
		}
		// Log other unhandled rejections but don't ignore them automatically
		console.error('Unhandled Rejection:', reason);
	});
}

// Handles better-auth API routes (e.g., /api/auth/sign-in/username, /api/auth/sign-up/email)
const handleAuth: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ auth, event, resolve, building });
};

// Validates the session cookie on each request and populates event.locals.user / session
const handleSession: Handle = async ({ event, resolve }) => {
	const sessionData = await auth.api.getSession({
		headers: event.request.headers
	});

	if (sessionData) {
		event.locals.user = sessionData.user;
		event.locals.session = sessionData.session;
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};

/**
 * Handle SEO and security headers
 */
const handleSeoHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Check if admin path - don't index admin pages
	const isAdminPath = event.url.pathname.startsWith('/admin');
	const isPrivatePath =
		event.url.pathname.startsWith('/dashboard') ||
		event.url.pathname.startsWith('/auth') ||
		event.url.pathname.startsWith('/api') ||
		event.url.pathname.startsWith('/checkout');

	// Add X-Robots-Tag header to prevent indexing of private pages
	if (isAdminPath || isPrivatePath) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	// Security headers for SEO and best practices
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'accelerometer=(), geolocation=(), gyroscope=()');

	// Cache headers for better SEO
	if (isAdminPath || isPrivatePath) {
		// Don't cache private pages
		response.headers.set(
			'Cache-Control',
			'private, no-cache, no-store, must-revalidate, max-age=0'
		);
	} else if (event.url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2)$/)) {
		// Cache static assets for 1 year
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (event.url.pathname === '/' || event.url.pathname === '/products') {
		// Cache homepage and product listing for 1 hour
		response.headers.set(
			'Cache-Control',
			'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
		);
	} else if (event.url.pathname.startsWith('/products/')) {
		// Cache product pages for 24 hours
		response.headers.set(
			'Cache-Control',
			'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
		);
	} else {
		// Default cache for other pages (1 hour)
		response.headers.set(
			'Cache-Control',
			'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
		);
	}

	return response;
};

export const handle: Handle = sequence(handleParaglide, handleAuth, handleSession, handleSeoHeaders);
