// $env/static/private: auth CLI cannot resolve $app/env/private yet (alias collision).
import { BETTER_AUTH_SECRET } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verified guest commenters get an HMAC-signed cookie so they can keep
 * commenting without re-verifying their email.
 */
const COOKIE_NAME = 'dc_commenter';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year

function sign(value: string): string {
	return createHmac('sha256', BETTER_AUTH_SECRET).update(value).digest('base64url');
}

export function setCommenterCookie(cookies: Cookies, commenterId: string) {
	cookies.set(COOKIE_NAME, `${commenterId}.${sign(commenterId)}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: COOKIE_MAX_AGE
	});
}

/** Returns the commenter id if the cookie is present and its signature is valid. */
export function readCommenterCookie(cookies: Cookies): string | null {
	const raw = cookies.get(COOKIE_NAME);
	if (!raw) return null;

	const separator = raw.lastIndexOf('.');
	if (separator <= 0) return null;

	const id = raw.slice(0, separator);
	const signature = Buffer.from(raw.slice(separator + 1));
	const expected = Buffer.from(sign(id));

	if (signature.length !== expected.length) return null;
	if (!timingSafeEqual(signature, expected)) return null;

	return id;
}
