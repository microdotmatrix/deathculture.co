// $env/static/private: auth CLI cannot resolve $app/env/private yet (alias collision).
import { UPLOADTHING_TOKEN } from '$env/static/private';
import { fileRouter } from '@/lib/server/uploadthing';
import type { RequestHandler } from '@sveltejs/kit';
import { createRouteHandler } from 'uploadthing/server';

const handler = createRouteHandler({
	router: fileRouter,
	config: { token: UPLOADTHING_TOKEN }
});

export const GET: RequestHandler = ({ request }) => handler(request);
export const POST: RequestHandler = ({ request }) => handler(request);
