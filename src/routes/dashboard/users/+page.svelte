<script lang="ts">
	import UserRow from '@/lib/components/dashboard/UserRow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Users — Studio — DeathCulture.co</title>
</svelte:head>

<p class="kicker">Community</p>
<h1>Users</h1>

{#if data.users.length === 0}
	<div class="empty">
		<p>No registered users yet.</p>
	</div>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th scope="col">User</th>
					<th scope="col">Role</th>
					<th scope="col">Newsletter</th>
					<th scope="col">Can comment</th>
					<th scope="col">Comments</th>
					<th scope="col">Joined</th>
					<th scope="col"><span class="sr-only">Actions</span></th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as row (row.id)}
					<UserRow {row} isSelf={row.id === data.user.id} />
				{/each}
			</tbody>
		</table>
	</div>
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

	.empty {
		margin-top: 2rem;
		padding: 2.5rem 2rem;
		text-align: center;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--muted);
	}

	.empty p {
		font-size: 0.9rem;
		color: var(--muted-foreground);
	}

	.table-wrap {
		margin-top: 2rem;
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	table {
		width: 100%;
		min-width: 44rem;
		border-collapse: collapse;
	}

	th {
		padding: 0.75rem 1rem;
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.18em;
		text-align: left;
		text-transform: uppercase;
		color: var(--secondary-700);
		background: var(--muted);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
