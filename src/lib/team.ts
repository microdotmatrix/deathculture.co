import { z } from 'zod';

export const MAX_NAME_LENGTH = 80;
export const MAX_INTRO_LENGTH = 120;
export const MAX_BIO_LENGTH = 4000;

/** Where a newly added profile lands: one past the current highest order. */
export function nextSortOrder(rows: readonly { sortOrder: number }[]): number {
	let highest = Number.NEGATIVE_INFINITY;
	for (const row of rows) {
		if (row.sortOrder > highest) highest = row.sortOrder;
	}
	return highest === Number.NEGATIVE_INFINITY ? 0 : highest + 1;
}

/**
 * The roster's id order after moving one profile a single step, or null when the
 * move is impossible (either edge, or an unknown id) so callers can no-op.
 *
 * Returns positions rather than a pair to swap: the caller writes index-as-
 * sortOrder across the whole roster, which repairs rows that share a sortOrder
 * (anything inserted by hand defaults to 0, and swapping equal values is inert).
 */
export function reorderIds(
	ids: readonly string[],
	id: string,
	direction: 'up' | 'down'
): string[] | null {
	const index = ids.indexOf(id);
	if (index === -1) return null;

	const target = direction === 'up' ? index - 1 : index + 1;
	if (target < 0 || target >= ids.length) return null;

	return ids.map((current, position) => {
		if (position === index) return ids[target];
		if (position === target) return ids[index];
		return current;
	});
}

/**
 * Bios are typed into a plain textarea, so a blank line is the paragraph break.
 * Empty paragraphs are dropped rather than rendered as empty `<p>` elements.
 */
export function splitBioParagraphs(bio: string): string[] {
	return bio
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}

/**
 * A name is all it takes to start a profile — everything else is filled in from
 * the editor afterwards. Trimmed first so whitespace can't stand in for a name.
 * Duplicates are allowed: two members really can share a name.
 */
export const teamMemberNameSchema = z.string().trim().min(1).max(MAX_NAME_LENGTH);

/**
 * Sparse patch — every field is optional so the editor can save one control at
 * a time. An empty `portraitUrl` is meaningful: it clears the portrait.
 */
export const updateTeamMemberSchema = z.object({
	id: z.string().min(1),
	name: teamMemberNameSchema.optional(),
	intro: z.string().max(MAX_INTRO_LENGTH).optional(),
	bio: z.string().max(MAX_BIO_LENGTH).optional(),
	portraitUrl: z.union([z.url(), z.literal('')]).optional(),
	published: z.boolean().optional()
});

export const moveTeamMemberSchema = z.object({
	id: z.string().min(1),
	direction: z.enum(['up', 'down'])
});
