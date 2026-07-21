import { getPublishedPostBySlug, listPublishedComments } from '@/lib/server/blog';
import { resolveViewerIdentity } from '@/lib/server/comment-identity';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedPostBySlug(params.slug);
	if (!post) error(404, 'Post not found');

	const viewer = await resolveViewerIdentity();
	const comments = await listPublishedComments(post.id);

	return {
		headerTone: 'light' as const,
		post,
		comments,
		memberName: viewer.type === 'member' ? viewer.name : null,
		guestName: viewer.type === 'guest' ? viewer.name : null,
		canComment: viewer.type === 'member' ? viewer.canComment : true
	};
};
