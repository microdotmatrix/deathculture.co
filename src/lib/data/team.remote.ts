import { randomUUID } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/db';
import { teamMember } from '@/lib/server/db/schema';
import {
	moveTeamMemberSchema,
	nextSortOrder,
	reorderIds,
	teamMemberNameSchema,
	updateTeamMemberSchema
} from '@/lib/team';
import { command, query } from '$app/server';

/** Published profiles for the public team page, in curated order. */
export const listTeamMembers = query(async () => {
	return db
		.select({
			id: teamMember.id,
			name: teamMember.name,
			intro: teamMember.intro,
			bio: teamMember.bio,
			portraitUrl: teamMember.portraitUrl
		})
		.from(teamMember)
		.where(eq(teamMember.published, true))
		.orderBy(asc(teamMember.sortOrder), asc(teamMember.createdAt));
});

/** The full roster for the studio, unpublished profiles included. */
export const listTeamMembersAdmin = query(async () => {
	requireAdmin();

	return db
		.select({
			id: teamMember.id,
			name: teamMember.name,
			intro: teamMember.intro,
			bio: teamMember.bio,
			portraitUrl: teamMember.portraitUrl,
			sortOrder: teamMember.sortOrder,
			published: teamMember.published
		})
		.from(teamMember)
		.orderBy(asc(teamMember.sortOrder), asc(teamMember.createdAt));
});

/** Starts a profile from a name alone — no user account required. */
export const createTeamMember = command(teamMemberNameSchema, async (name) => {
	requireAdmin();

	const rows = await db.select({ sortOrder: teamMember.sortOrder }).from(teamMember);
	const id = randomUUID();

	await db.insert(teamMember).values({ id, name, sortOrder: nextSortOrder(rows) });

	return { id };
});

export const updateTeamMember = command(updateTeamMemberSchema, async (data) => {
	requireAdmin();

	const existing = await db.query.teamMember.findFirst({
		columns: { id: true },
		where: eq(teamMember.id, data.id)
	});
	if (!existing) error(404, 'Team profile not found');

	const patch = {
		...(data.name !== undefined ? { name: data.name } : {}),
		...(data.intro !== undefined ? { intro: data.intro.trim() } : {}),
		...(data.bio !== undefined ? { bio: data.bio.trim() } : {}),
		...(data.portraitUrl !== undefined ? { portraitUrl: data.portraitUrl || null } : {}),
		...(data.published !== undefined ? { published: data.published } : {})
	};

	if (Object.keys(patch).length > 0) {
		await db.update(teamMember).set(patch).where(eq(teamMember.id, data.id));
	}

	return { updated: true };
});

/**
 * Moves a profile one step. Rewrites sortOrder across the whole roster from the
 * resulting positions, so a roster whose rows share a sortOrder is repaired in
 * passing rather than refusing to move.
 */
export const moveTeamMember = command(moveTeamMemberSchema, async ({ id, direction }) => {
	requireAdmin();

	const roster = await db
		.select({ id: teamMember.id })
		.from(teamMember)
		.orderBy(asc(teamMember.sortOrder), asc(teamMember.createdAt));

	if (!roster.some((row) => row.id === id)) error(404, 'Team profile not found');

	const reordered = reorderIds(
		roster.map((row) => row.id),
		id,
		direction
	);
	if (!reordered) return { moved: false };

	// Neon's HTTP driver has no transactions, so the writes go in one batch.
	const writes = reordered.map((rowId, position) =>
		db.update(teamMember).set({ sortOrder: position }).where(eq(teamMember.id, rowId))
	);

	await db.batch(writes as [(typeof writes)[number], ...(typeof writes)[number][]]);

	return { moved: true };
});

/** Deletes the profile. Nothing else references it, so this is the whole story. */
export const removeTeamMember = command(z.string().min(1), async (id) => {
	requireAdmin();

	await db.delete(teamMember).where(eq(teamMember.id, id));
	return { deleted: true };
});
