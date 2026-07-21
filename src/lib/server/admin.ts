import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

/**
 * Guard for admin-only remote functions and loads. Throws 401/403 instead of
 * redirecting so poked endpoints don't leak anything useful.
 */
export function requireAdmin() {
	const { locals } = getRequestEvent();

	if (!locals.user) error(401, 'Sign in required');
	if (locals.user.role !== 'admin') error(403, 'Admin access required');

	return locals.user;
}
