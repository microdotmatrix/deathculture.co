import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	MAX_BIO_LENGTH,
	MAX_INTRO_LENGTH,
	MAX_NAME_LENGTH,
	nextSortOrder,
	reorderIds,
	splitBioParagraphs,
	teamMemberNameSchema,
	updateTeamMemberSchema
} from '../team.ts';

describe('nextSortOrder', () => {
	it('starts at 0 for an empty roster', () => {
		assert.equal(nextSortOrder([]), 0);
	});

	it('places a new profile one past the highest order', () => {
		assert.equal(nextSortOrder([{ sortOrder: 0 }, { sortOrder: 1 }, { sortOrder: 2 }]), 3);
	});

	it('reads the maximum, not the row count, so gaps cannot collide', () => {
		assert.equal(nextSortOrder([{ sortOrder: 0 }, { sortOrder: 7 }, { sortOrder: 3 }]), 8);
	});

	it('handles negative orders left behind by manual edits', () => {
		assert.equal(nextSortOrder([{ sortOrder: -5 }, { sortOrder: -2 }]), -1);
	});
});

describe('reorderIds', () => {
	const roster = ['a', 'b', 'c'];

	it('moves a middle row up past its predecessor', () => {
		assert.deepEqual(reorderIds(roster, 'b', 'up'), ['b', 'a', 'c']);
	});

	it('moves a middle row down past its successor', () => {
		assert.deepEqual(reorderIds(roster, 'b', 'down'), ['a', 'c', 'b']);
	});

	it('refuses to move the first row up', () => {
		assert.equal(reorderIds(roster, 'a', 'up'), null);
	});

	it('refuses to move the last row down', () => {
		assert.equal(reorderIds(roster, 'c', 'down'), null);
	});

	it('returns null for an id that is not on the roster', () => {
		assert.equal(reorderIds(roster, 'missing', 'up'), null);
	});

	it('cannot move a sole member in either direction', () => {
		assert.equal(reorderIds(['only'], 'only', 'up'), null);
		assert.equal(reorderIds(['only'], 'only', 'down'), null);
	});

	it('leaves the input array untouched', () => {
		const input = ['a', 'b', 'c'];
		reorderIds(input, 'b', 'up');
		assert.deepEqual(input, ['a', 'b', 'c']);
	});

	it('renumbers from the display order, so duplicate sortOrder values self-heal', () => {
		// Three rows inserted by hand all carry sortOrder 0; the returned order is
		// positional, so writing back index-as-sortOrder repairs the roster.
		assert.deepEqual(reorderIds(['x', 'y', 'z'], 'z', 'up'), ['x', 'z', 'y']);
	});
});

describe('splitBioParagraphs', () => {
	it('returns one paragraph for a single-paragraph bio', () => {
		assert.deepEqual(splitBioParagraphs('Julia has worked as a specialist.'), [
			'Julia has worked as a specialist.'
		]);
	});

	it('splits on a blank line', () => {
		assert.deepEqual(splitBioParagraphs('First para.\n\nSecond para.'), [
			'First para.',
			'Second para.'
		]);
	});

	it('collapses runs of three or more blank lines into one break', () => {
		assert.deepEqual(splitBioParagraphs('One.\n\n\n\nTwo.'), ['One.', 'Two.']);
	});

	it('treats a whitespace-only line as a blank line', () => {
		assert.deepEqual(splitBioParagraphs('One.\n   \nTwo.'), ['One.', 'Two.']);
	});

	it('keeps single newlines inside a paragraph rather than splitting on them', () => {
		assert.deepEqual(splitBioParagraphs('Line one\nline two'), ['Line one\nline two']);
	});

	it('trims each paragraph', () => {
		assert.deepEqual(splitBioParagraphs('  padded.  \n\n\ttabbed.\t'), ['padded.', 'tabbed.']);
	});

	it('drops empty paragraphs instead of rendering blank <p> elements', () => {
		assert.deepEqual(splitBioParagraphs('\n\n\n'), []);
	});

	it('returns nothing for an empty bio', () => {
		assert.deepEqual(splitBioParagraphs(''), []);
	});
});

describe('teamMemberNameSchema', () => {
	it('accepts a plain name', () => {
		assert.equal(teamMemberNameSchema.safeParse('Julia Restrepo').success, true);
	});

	it('trims surrounding whitespace', () => {
		assert.equal(teamMemberNameSchema.parse('  Julia Restrepo  '), 'Julia Restrepo');
	});

	it('rejects an empty name', () => {
		assert.equal(teamMemberNameSchema.safeParse('').success, false);
	});

	it('rejects whitespace standing in for a name', () => {
		assert.equal(teamMemberNameSchema.safeParse('   ').success, false);
	});

	it(`accepts a name at exactly ${MAX_NAME_LENGTH} characters`, () => {
		assert.equal(teamMemberNameSchema.safeParse('x'.repeat(MAX_NAME_LENGTH)).success, true);
	});

	it('rejects a name one character past the limit', () => {
		assert.equal(teamMemberNameSchema.safeParse('x'.repeat(MAX_NAME_LENGTH + 1)).success, false);
	});

	it('rejects a non-string', () => {
		assert.equal(teamMemberNameSchema.safeParse(undefined).success, false);
		assert.equal(teamMemberNameSchema.safeParse(42).success, false);
	});
});

describe('updateTeamMemberSchema', () => {
	it('accepts a full patch', () => {
		const result = updateTeamMemberSchema.safeParse({
			id: 'abc',
			name: 'Julia Restrepo',
			intro: "Hi, I'm Julia.",
			bio: 'Julia has worked as an Advanced Planning Specialist for four years.',
			portraitUrl: 'https://example.ufs.sh/f/portrait.jpg',
			published: true
		});
		assert.equal(result.success, true);
	});

	it('accepts a sparse patch, so one field can be saved alone', () => {
		assert.equal(updateTeamMemberSchema.safeParse({ id: 'abc', published: false }).success, true);
	});

	it('requires an id', () => {
		assert.equal(updateTeamMemberSchema.safeParse({ intro: 'orphan' }).success, false);
	});

	it('rejects an empty id', () => {
		assert.equal(updateTeamMemberSchema.safeParse({ id: '' }).success, false);
	});

	it('rejects a blank name, which would leave the card nameless', () => {
		assert.equal(updateTeamMemberSchema.safeParse({ id: 'abc', name: '   ' }).success, false);
	});

	it(`accepts an intro at exactly ${MAX_INTRO_LENGTH} characters`, () => {
		const intro = 'x'.repeat(MAX_INTRO_LENGTH);
		assert.equal(updateTeamMemberSchema.safeParse({ id: 'abc', intro }).success, true);
	});

	it('rejects an intro one character past the limit', () => {
		const intro = 'x'.repeat(MAX_INTRO_LENGTH + 1);
		assert.equal(updateTeamMemberSchema.safeParse({ id: 'abc', intro }).success, false);
	});

	it('rejects a bio past the limit', () => {
		const bio = 'x'.repeat(MAX_BIO_LENGTH + 1);
		assert.equal(updateTeamMemberSchema.safeParse({ id: 'abc', bio }).success, false);
	});

	it('accepts an empty portraitUrl, which is how a portrait gets cleared', () => {
		assert.equal(updateTeamMemberSchema.safeParse({ id: 'abc', portraitUrl: '' }).success, true);
	});

	it('rejects a portraitUrl that is not a URL', () => {
		assert.equal(
			updateTeamMemberSchema.safeParse({ id: 'abc', portraitUrl: 'not-a-url' }).success,
			false
		);
	});
});
