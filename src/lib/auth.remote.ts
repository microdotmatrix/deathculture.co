import { form, getRequestEvent } from '$app/server';
import { auth } from '@/lib/server/auth';
import { invalid, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { z } from 'zod';

const email = z.email('Enter a valid email address');
// Leading underscore keeps the value out of the response if validation fails.
const password = z.string().min(8, 'Password must be at least 8 characters');

export const signIn = form(z.object({ email, _password: password }), async (data) => {
	try {
		await auth.api.signInEmail({
			body: { email: data.email, password: data._password }
		});
	} catch (error) {
		if (error instanceof APIError) {
			invalid('Invalid email or password');
		}
		throw error;
	}

	redirect(303, '/dashboard');
});

export const signUp = form(
	z.object({
		name: z.string().min(2, 'Tell us your name'),
		email,
		_password: password
	}),
	async (data) => {
		try {
			await auth.api.signUpEmail({
				body: { name: data.name, email: data.email, password: data._password }
			});
		} catch (error) {
			if (error instanceof APIError) {
				invalid(error.message || 'Registration failed');
			}
			throw error;
		}

		redirect(303, '/dashboard');
	}
);

export const signOut = form(async () => {
	const { request } = getRequestEvent();
	await auth.api.signOut({ headers: request.headers });

	redirect(303, '/');
});
