import { generateSvelteHelpers } from '@uploadthing/svelte';
import type { PostFileRouter } from './server/uploadthing';

export const { createUploadThing } = generateSvelteHelpers<PostFileRouter>();
