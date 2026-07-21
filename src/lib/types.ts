export interface PostImage {
	src: string;
	width: number;
	height: number;
	alt: string;
}

export interface PostPreview {
	slug: string;
	title: string;
	excerpt: string;
	date: string;
	readingTime: string;
	image: PostImage | null;
}

export interface EditorPost {
	id: string;
	title: string;
	/** TipTap JSON document. */
	content: import('@tiptap/core').JSONContent | null;
	excerpt: string;
	slug: string;
	featureImage: string;
	featureImageAlt: string;
	status: 'draft' | 'published';
	tags: string[];
	commentsEnabled: boolean;
}

export interface CommentView {
	id: string;
	authorName: string;
	isMember: boolean;
	body: string;
	createdAt: Date;
	pinned: boolean;
	likeCount: number;
	likedByMe: boolean;
	parentId: string | null;
	/** Only populated on top-level comments; always [] on replies. */
	replies: CommentView[];
}
