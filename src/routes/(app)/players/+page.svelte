<script lang="ts">
import { TrashIcon } from "svelte-feather-icons";
import { enhance } from "$app/forms";
import Button from "../../../components/Button.svelte";
import MeepleDot from "../../../components/MeepleDot.svelte";
import PageTitle from "../../../components/PageTitle.svelte";
import type { ActionData, PageData } from "./$types";

export let data: PageData;
export let form: ActionData;

const colors = ["red", "blue", "green", "yellow", "gray", "black"] as const;
</script>

<svelte:head>
	<title>Players</title>
</svelte:head>

<PageTitle>Players</PageTitle>

<form method="POST" action="?/create" use:enhance class="mt-5 flex gap-3">
	<label class="sr-only" for="playerName">Player name</label>
	<input
		class="min-h-[52px] min-w-0 flex-1 rounded-2xl border-2 border-ink bg-surface px-4 text-lg text-ink placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-meeple-yellow"
		id="playerName"
		name="name"
		type="text"
		placeholder="Add a player"
		autocomplete="off"
		aria-describedby={form?.error ? "players-error" : undefined}
	>
	<Button type="submit">Add</Button>
</form>
{#if form?.error}
	<p id="players-error" class="mt-2 font-bold text-meeple-red" role="alert">
		{form.error}
	</p>
{/if}

<ul class="mt-5 flex flex-col gap-3">
	{#each data.players as player, i (player.id)}
		<li class="flex items-center gap-3 rounded-3xl bg-surface p-4">
			<MeepleDot
				color={colors[i % colors.length]}
				label={player.name.charAt(0).toUpperCase()}
				size={48}
			/>
			<div class="min-w-0 flex-1">
				<p class="truncate font-display text-xl font-semibold text-ink">
					{player.name}
				</p>
				<p class="text-sm font-bold text-muted">
					Added {new Date(player.created_at).toLocaleDateString()}
				</p>
			</div>
			<form method="POST" action="?/remove" use:enhance>
				<input type="hidden" name="id" value={player.id}>
				<button
					type="submit"
					class="flex h-11 w-11 items-center justify-center rounded-full text-muted"
					aria-label="Remove {player.name}"
				>
					<TrashIcon size="22" />
				</button>
			</form>
		</li>
	{/each}
</ul>
