import { generateSvelteHelpers } from '@uploadthing/svelte';
import type { AppFileRouter } from './server/uploadthing';

export const { createUploadThing } = generateSvelteHelpers<AppFileRouter>();
