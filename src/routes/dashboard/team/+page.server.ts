import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * A friendly bounce for non-admins. The real boundary is `requireAdmin()` inside
 * each remote function in `data/team.remote.ts`.
 */
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	if (locals.user.role !== 'admin') redirect(303, '/dashboard');

	return { user: locals.user };
};
