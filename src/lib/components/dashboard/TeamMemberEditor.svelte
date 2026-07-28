<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		Badge,
		Button,
		Field,
		IconButton,
		ImageUpload,
		Input,
		Textarea,
		ToggleSwitch
	} from '@/lib/components/ui';
	import { MAX_BIO_LENGTH, MAX_INTRO_LENGTH, MAX_NAME_LENGTH } from '@/lib/team';
	import { moveTeamMember, removeTeamMember, updateTeamMember } from '@/lib/data/team.remote';

	interface TeamMemberRowData {
		id: string;
		name: string;
		intro: string;
		bio: string;
		portraitUrl: string | null;
		published: boolean;
	}

	interface Props {
		row: TeamMemberRowData;
		/** Move controls are disabled at the ends of the roster. */
		isFirst: boolean;
		isLast: boolean;
	}

	let { row, isFirst, isLast }: Props = $props();

	let editing = $state(false);
	let busy = $state(false);
	let errorMessage = $state('');

	let nameDraft = $state('');
	let introDraft = $state('');
	let bioDraft = $state('');
	let portraitDraft = $state('');

	/** A profile is nothing but its name until the rest is written, so it's required. */
	const canSave = $derived(nameDraft.trim().length > 0);

	async function run(action: () => Promise<unknown>) {
		if (busy) return;
		busy = true;
		errorMessage = '';

		try {
			await action();
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Something went wrong';
		} finally {
			busy = false;
		}
	}

	function startEditing() {
		nameDraft = row.name;
		introDraft = row.intro;
		bioDraft = row.bio;
		portraitDraft = row.portraitUrl ?? '';
		editing = true;
	}

	async function save() {
		if (!canSave) return;

		await run(() =>
			updateTeamMember({
				id: row.id,
				name: nameDraft,
				intro: introDraft,
				bio: bioDraft,
				portraitUrl: portraitDraft
			})
		);
		if (!errorMessage) editing = false;
	}

	async function remove() {
		if (!confirm(`Remove ${row.name}'s team profile? This cannot be undone.`)) return;
		await run(() => removeTeamMember(row.id));
	}
</script>

<li class="member-row">
	<div class="summary">
		<div class="thumb">
			{#if row.portraitUrl}
				<img src={row.portraitUrl} alt="" width="112" height="140" />
			{:else}
				<span class="thumb-empty" aria-hidden="true">—</span>
			{/if}
		</div>

		<div class="identity">
			<p class="name">
				{row.name}
				{#if row.published}
					<Badge tone="primary">Published</Badge>
				{:else}
					<Badge tone="neutral">Draft</Badge>
				{/if}
			</p>
			<p class="intro-preview">{row.intro || 'No intro line yet'}</p>
		</div>

		<div class="controls">
			<div class="order">
				<IconButton
					label={`Move ${row.name} up`}
					size="sm"
					variant="outline"
					disabled={isFirst || busy}
					onclick={() => run(() => moveTeamMember({ id: row.id, direction: 'up' }))}
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M12 19V5m0 0-6 6m6-6 6 6"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</IconButton>
				<IconButton
					label={`Move ${row.name} down`}
					size="sm"
					variant="outline"
					disabled={isLast || busy}
					onclick={() => run(() => moveTeamMember({ id: row.id, direction: 'down' }))}
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M12 5v14m0 0 6-6m-6 6-6-6"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</IconButton>
			</div>

			<ToggleSwitch
				checked={row.published}
				label={`Publish ${row.name}`}
				hideLabel
				disabled={busy}
				onchange={(next) => run(() => updateTeamMember({ id: row.id, published: next }))}
			/>

			<Button
				size="sm"
				disabled={busy}
				onclick={() => (editing ? (editing = false) : startEditing())}
			>
				{editing ? 'Close' : 'Edit'}
			</Button>
			<Button variant="danger" size="sm" disabled={busy} onclick={remove}>Remove</Button>
		</div>
	</div>

	{#if errorMessage}
		<p class="error" role="alert">{errorMessage}</p>
	{/if}

	{#if editing}
		<form
			class="editor"
			onsubmit={(event) => {
				event.preventDefault();
				save();
			}}
		>
			<div class="editor-portrait">
				<p class="editor-label">Portrait</p>
				<ImageUpload
					bind:url={portraitDraft}
					endpoint="teamPortrait"
					aspect="4 / 5"
					title="Add a portrait"
					hint="Drop a portrait here or click to browse"
					previewAlt={`Portrait of ${row.name}`}
					width={800}
					height={1000}
				/>
			</div>

			<div class="editor-fields">
				<Field label="Name" hint="Shown on the card, and as the portrait's alt text.">
					<Input
						type="text"
						maxlength={MAX_NAME_LENGTH}
						placeholder="Julia Restrepo"
						bind:value={nameDraft}
						disabled={busy}
					/>
				</Field>

				<Field
					label="Intro line"
					hint={`The card heading, in their voice — max ${MAX_INTRO_LENGTH} characters.`}
				>
					<Input
						type="text"
						maxlength={MAX_INTRO_LENGTH}
						placeholder="Hi, I'm Julia."
						bind:value={introDraft}
						disabled={busy}
					/>
				</Field>

				<Field label="Bio" hint="Leave a blank line between paragraphs.">
					<Textarea
						rows={9}
						maxlength={MAX_BIO_LENGTH}
						placeholder="What brought them to this work."
						bind:value={bioDraft}
						disabled={busy}
					/>
				</Field>

				<div class="editor-actions">
					<Button type="submit" variant="primary" size="sm" disabled={!canSave} loading={busy}>
						Save
					</Button>
					<Button size="sm" disabled={busy} onclick={() => (editing = false)}>Cancel</Button>
				</div>
			</div>
		</form>
	{/if}
</li>

<style>
	.member-row {
		padding-block: 1.1rem;
		border-top: 1px solid var(--border);
	}

	.summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	.thumb {
		flex-shrink: 0;
		width: 3.5rem;
		overflow: clip;
		border-radius: var(--radius-sm);
		background: var(--muted);
	}

	.thumb img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		filter: grayscale(0.85);
	}

	.thumb-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 4 / 5;
		color: var(--base-400);
	}

	.identity {
		flex: 1;
		min-width: 12rem;
	}

	.name {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--foreground);
	}

	.intro-preview {
		margin-top: 0.35rem;
		font-size: 0.82rem;
		color: var(--base-500);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.order {
		display: flex;
		gap: 0.25rem;
	}

	.error {
		margin-top: 0.5rem;
		font-size: 0.78rem;
		color: var(--destructive);
	}

	.editor {
		display: grid;
		gap: 1.25rem;
		margin-top: 1.25rem;
		padding: 1.25rem;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	@media (min-width: 640px) {
		.editor {
			grid-template-columns: 14rem 1fr;
		}
	}

	.editor-label {
		margin-bottom: 0.35rem;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--base-600);
	}

	.editor-fields {
		display: grid;
		gap: 1rem;
		align-content: start;
	}

	.editor-actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
