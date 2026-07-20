import { form } from '$app/server';
import { z } from 'zod';

export const subscribe = form(
	z.object({ email: z.email('Enter a valid email address') }),
	async ({ email }) => {
		// TODO: persist to a subscribers table / hand off to an email provider.
		return { success: true, email };
	}
);
