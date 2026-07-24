<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button, Input, Select, ToggleSwitch } from '@/lib/components/ui';
	import { removeUser, updateUser } from '@/lib/users.remote';

	interface UserRowData {
		id: string;
		name: string;
		email: string;
		role: 'admin' | 'member';
		canComment: boolean;
		subscribed: boolean;
		commentCount: number;
		joined: string;
	}

	interface Props {
		row: UserRowData;
		/** The signed-in admin can't demote or delete themselves. */
		isSelf: boolean;
	}

	let { row, isSelf }: Props = $props();

	let editingName = $state(false);
	let nameDraft = $state('');
	let busy = $state(false);
	let errorMessage = $state('');

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

	function startEditingName() {
		nameDraft = row.name;
		editingName = true;
	}

	async function saveName() {
		const next = nameDraft.trim();
		if (!next || next === row.name) {
			editingName = false;
			return;
		}
		await run(() => updateUser({ id: row.id, name: next }));
		if (!errorMessage) editingName = false;
	}

	async function remove() {
		if (!confirm(`Remove ${row.name}? Their comments stay, shown as "Anonymous".`)) return;
		await run(() => removeUser(row.id));
	}
</script>

<tr class="user-row">
	<td>
		{#if editingName}
			<form
				class="name-edit"
				onsubmit={(event) => {
					event.preventDefault();
					saveName();
				}}
			>
				<!-- autofocus is intentional: focus moves into the field the user just asked to edit -->
				<span class="name-input">
					<Input
						type="text"
						dense
						maxlength={200}
						bind:value={nameDraft}
						disabled={busy}
						autofocus
					/>
				</span>
				<Button type="submit" size="sm" disabled={busy}>Save</Button>
				<Button size="sm" onclick={() => (editingName = false)}>Cancel</Button>
			</form>
		{:else}
			<button type="button" class="name-btn" title="Edit name" onclick={startEditingName}>
				{row.name}
			</button>
		{/if}
		<p class="email">{row.email}</p>
		{#if errorMessage}
			<p class="error" role="alert">{errorMessage}</p>
		{/if}
	</td>
	<td>
		<Select
			value={row.role}
			disabled={isSelf || busy}
			onchange={(event) =>
				run(() =>
					updateUser({ id: row.id, role: event.currentTarget.value as 'admin' | 'member' })
				)}
		>
			<option value="member">Member</option>
			<option value="admin">Admin</option>
		</Select>
	</td>
	<td>
		<ToggleSwitch
			checked={row.subscribed}
			label={`Newsletter for ${row.name}`}
			hideLabel
			disabled={busy}
			onchange={(next) => run(() => updateUser({ id: row.id, subscribed: next }))}
		/>
	</td>
	<td>
		<ToggleSwitch
			checked={row.canComment}
			label={`Commenting for ${row.name}`}
			hideLabel
			disabled={busy}
			onchange={(next) => run(() => updateUser({ id: row.id, canComment: next }))}
		/>
	</td>
	<td class="count">{row.commentCount}</td>
	<td class="joined">{row.joined}</td>
	<td>
		<Button variant="danger" size="sm" disabled={isSelf || busy} onclick={remove}>Remove</Button>
	</td>
</tr>

<style>
	.user-row td {
		padding: 0.85rem 1rem;
		vertical-align: middle;
		border-top: 1px solid var(--border);
	}

	.name-btn {
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--foreground);
		text-align: left;
		border-bottom: 1px dashed transparent;
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	.name-btn:hover,
	.name-btn:focus-visible {
		border-color: var(--secondary);
	}

	.name-edit {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}

	.name-input {
		display: flex;
		flex: 1;
		min-width: 8rem;
	}

	.email {
		margin-top: 0.2rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.error {
		margin-top: 0.3rem;
		font-size: 0.75rem;
		color: var(--destructive);
	}

	.count {
		font-variant-numeric: tabular-nums;
		font-size: 0.88rem;
		color: var(--foreground);
	}

	.joined {
		font-size: 0.8rem;
		color: var(--muted-foreground);
		white-space: nowrap;
	}
</style>
