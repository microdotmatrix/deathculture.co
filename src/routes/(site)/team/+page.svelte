<script lang="ts">
	import TeamMemberRow from '@/lib/components/site/TeamMemberRow.svelte';
	import { listTeamMembers } from '@/lib/data/team.remote';

	const members = await listTeamMembers();
</script>

<svelte:head>
	<title>Team — DeathCulture.co</title>
	<meta
		name="description"
		content="Meet the people behind DeathCulture.co — why we started, and what brought each of us to the work of reshaping death culture."
	/>
</svelte:head>

<div class="team-page">
	<header class="team-hero">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<p class="kicker">Team</p>
			<h1>Who are we?</h1>
			<p class="lede">
				A small group that went looking for support around death, found the subject unspoken, and
				decided to say something instead.
			</p>
		</div>
	</header>

	{#if members.length > 0}
		<section class="mx-auto max-w-6xl px-5 pb-20 sm:px-8" aria-label="Team members">
			<div class="member-list">
				{#each members as member, index (member.id)}
					<TeamMemberRow {member} flip={index % 2 === 1} eager={index === 0} />
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.team-page {
		background: var(--background);
	}

	.team-hero {
		padding-block: clamp(7rem, 5rem + 8vw, 11rem) clamp(1rem, 0.5rem + 1.5vw, 2rem);
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2.2rem, 1.6rem + 3vw, 4rem);
		line-height: 1.1;
		color: var(--foreground);
		text-wrap: balance;
	}

	.lede {
		margin-top: 1rem;
		max-width: 34rem;
		font-size: 1rem;
		line-height: 1.65;
		color: var(--muted-foreground);
	}

	.member-list :global(article + article) {
		border-top: 1px dashed var(--border);
	}
</style>
