import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('inline image dialog positioning', () => {
	it('centers the modal explicitly after the global CSS reset', () => {
		const source = readFileSync(new URL('./InlineImageDialog.svelte', import.meta.url), 'utf8');
		const dialogRule = source.match(/\.image-dialog\s*\{([^}]+)\}/)?.[1] ?? '';

		assert.match(dialogRule, /position:\s*fixed/);
		assert.match(dialogRule, /inset:\s*0/);
		assert.match(dialogRule, /margin:\s*auto/);
	});
});
