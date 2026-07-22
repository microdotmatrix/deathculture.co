import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		headerTone: 'light' as const
	};
};
