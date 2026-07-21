import type { Extensions } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';

/**
 * The single extension set shared by the editor (client) and the HTML
 * renderer (server). Post HTML is only ever generated from TipTap JSON with
 * these extensions, so the output is constrained to this schema.
 */
export const postExtensions: Extensions = [
	StarterKit.configure({
		heading: { levels: [2, 3, 4] },
		link: {
			openOnClick: false,
			HTMLAttributes: { rel: 'noopener noreferrer' }
		}
	})
];
