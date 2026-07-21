import { listPublishedPosts } from '@/lib/server/blog';
import type { PageServerLoad } from './$types';

const LANDING_POST_COUNT = 3;

export const load: PageServerLoad = async () => {
	return { latestPosts: await listPublishedPosts(LANDING_POST_COUNT) };
};
