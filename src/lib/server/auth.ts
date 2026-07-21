// $env/static/private: auth CLI cannot resolve $app/env/private yet (alias collision).

import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, ORIGIN } from '$env/static/private';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './db';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			// `input: false` — clients can never set their own role at sign-up.
			role: { type: 'string', defaultValue: 'member', input: false }
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
