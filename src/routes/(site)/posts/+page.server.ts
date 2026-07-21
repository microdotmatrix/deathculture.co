import { listPublishedPosts } from '@/lib/server/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		headerTone: 'light' as const,
		posts: await listPublishedPosts()
	};
};
