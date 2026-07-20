export interface PostPreview {
	slug: string;
	title: string;
	excerpt: string;
	date: string;
	readingTime: string;
	image: { src: string; width: number; height: number; alt: string };
}

// Placeholder content until the blog backend lands — swap images for real photography.
export const latestPosts: PostPreview[] = [
	{
		slug: 'the-death-positivity-movement',
		title: 'The Death Positivity Movement: Changing Perspectives on Mortality',
		excerpt:
			'One platform that is taking the lead in catering to this growing demographic is DeathCulture.co.',
		date: '13 Mar 2025',
		readingTime: '3 min read',
		image: {
			src: 'https://picsum.photos/seed/deathculture-post-1/1200/800?grayscale',
			width: 1200,
			height: 800,
			alt: 'A support circle gathered in conversation'
		}
	},
	{
		slug: 'embracing-mortality-funeral-planning',
		title: 'Embracing Mortality: How to Approach Funeral Planning with Positivity',
		excerpt:
			'Funeral planning does not have to be morbid — approached openly, it becomes an act of care.',
		date: '13 Mar 2025',
		readingTime: '3 min read',
		image: {
			src: 'https://picsum.photos/seed/deathculture-post-2/1200/800?grayscale',
			width: 1200,
			height: 800,
			alt: 'Headstones adorned with fresh flowers'
		}
	},
	{
		slug: 'navigating-end-of-life-conversations',
		title: 'Navigating End-of-Life Conversations: Tips for Planning Ahead',
		excerpt:
			'Starting the conversation early gives everyone involved clarity, comfort, and direction.',
		date: '13 Mar 2025',
		readingTime: '3 min read',
		image: {
			src: 'https://picsum.photos/seed/deathculture-post-3/1200/800?grayscale',
			width: 1200,
			height: 800,
			alt: 'A compass resting on an old map'
		}
	}
];
