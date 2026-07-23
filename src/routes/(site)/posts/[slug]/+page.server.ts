import { getPublishedPostShell } from '@/lib/server/blog';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedPostShell(params.slug);
	if (!post) error(404, 'Post not found');

	return {
		post,
		headerTone: 'light' as const
	};
};
