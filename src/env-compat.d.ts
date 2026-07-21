// The Better Auth CLI can't resolve `$app/env/private` yet (alias collision), so
// `src/lib/server/auth.ts` and the db client import from `$env/static/private`.
// Kit no longer emits type declarations for that module — mirror src/env.ts here.
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const ORIGIN: string;
	export const BETTER_AUTH_SECRET: string;
	export const UPLOADTHING_TOKEN: string;
}
