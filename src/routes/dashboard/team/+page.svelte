<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import TeamMemberEditor from '@/lib/components/dashboard/TeamMemberEditor.svelte';
	import { Button, EmptyState, Field, Input } from '@/lib/components/ui';
	import { MAX_NAME_LENGTH } from '@/lib/team';
	import { createTeamMember, listTeamMembersAdmin } from '@/lib/data/team.remote';

	const members = await listTeamMembersAdmin();

	let newName = $state('');
	let adding = $state(false);
	let addError = $state('');

	const canAdd = $derived(newName.trim().length > 0);

	async function add() {
		if (!canAdd || adding) return;
		adding = true;
		addError = '';

		try {
			await createTeamMember(newName);
			newName = '';
			await refreshAll();
		} catch (error) {
			addError = error instanceof Error ? error.message : 'Could not add that member';
		} finally {
			adding = false;
		}
	}
</script>

<svelte:head>
	<title>Team — Studio — DeathCulture.co</title>
</svelte:head>

<p class="kicker">Who we are</p>
<h1>Team</h1>
<p class="lede">
	Profiles appear on <a href="/team">the team page</a> in this order, once published. A profile stands
	on its own — the member doesn't need an account here.
</p>

<section class="add" aria-labelledby="add-heading">
	<h2 id="add-heading">Add a member</h2>

	<form
		class="add-form"
		onsubmit={(event) => {
			event.preventDefault();
			add();
		}}
	>
		<Field label="Name" hideLabel orientation="inline">
			<Input
				type="text"
				maxlength={MAX_NAME_LENGTH}
				placeholder="Their name…"
				autocomplete="off"
				bind:value={newName}
				disabled={adding}
			/>
		</Field>
		<Button type="submit" variant="primary" size="sm" disabled={!canAdd} loading={adding}>
			Add profile
		</Button>
	</form>

	<p class="add-note">Start with a name — the portrait, intro and bio come next, from Edit.</p>

	{#if addError}
		<p class="error" role="alert">{addError}</p>
	{/if}
</section>

{#if members.length === 0}
	<EmptyState>No team profiles yet. Add one above to get started.</EmptyState>
{:else}
	<ul class="roster">
		{#each members as member, index (member.id)}
			<TeamMemberEditor row={member} isFirst={index === 0} isLast={index === members.length - 1} />
		{/each}
	</ul>
{/if}

<style>
	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	h1 {
		margin-top: 0.5rem;
		font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.6rem);
		color: var(--foreground);
	}

	.lede {
		margin-top: 0.75rem;
		max-width: 36rem;
		font-size: 0.88rem;
		line-height: 1.65;
		color: var(--muted-foreground);
	}

	.lede a {
		color: var(--secondary-800);
		text-decoration: underline;
		text-decoration-color: var(--secondary-300);
		text-underline-offset: 0.2em;
		transition: color var(--duration-fast, 150ms) ease;
	}

	.lede a:hover,
	.lede a:focus-visible {
		color: var(--secondary-600);
	}

	.add {
		margin-top: 2rem;
		padding: 1.25rem;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
	}

	h2 {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	.add-form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.85rem;
	}

	/* The name field takes the slack; the button keeps its intrinsic width. */
	.add-form :global(.field) {
		flex: 1 1 16rem;
		min-width: 0;
		max-width: 24rem;
	}

	.add-note {
		margin-top: 0.6rem;
		font-size: 0.82rem;
		color: var(--muted-foreground);
	}

	.error {
		margin-top: 0.6rem;
		font-size: 0.78rem;
		color: var(--destructive);
	}

	.roster {
		margin-top: 2rem;
		border-bottom: 1px solid var(--border);
	}
</style>
