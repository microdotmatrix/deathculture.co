import type { Extensions } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
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
	}),
	Image.configure({
		resize: {
			enabled: true,
			directions: ['bottom-right'],
			minWidth: 160,
			minHeight: 90,
			alwaysPreserveAspectRatio: true
		}
	}),
	TableKit.configure({
		table: {
			resizable: true,
			lastColumnResizable: false
		}
	})
];
