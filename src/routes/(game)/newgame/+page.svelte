<script lang="ts">
import { CheckIcon } from "svelte-feather-icons";
import { enhance } from "$app/forms";
import { type MeepleColor, nextFreeColor } from "$lib/meeple";
import { MAX_PLAYERS, MIN_PLAYERS } from "$lib/services/gameRules";
import Button from "../../../components/Button.svelte";
import MeepleDot from "../../../components/MeepleDot.svelte";
import PageHeader from "../../../components/PageHeader.svelte";
import type { ActionData, PageData } from "./$types";

export let data: PageData;
export let form: ActionData;

// Player id -> chosen meeple color, in the order players were tapped in.
let selected: Record<string, MeepleColor> = {};

$: count = Object.keys(selected).length;
$: full = count >= MAX_PLAYERS;
$: canStart = count >= MIN_PLAYERS;

function toggle(id: string) {
	if (id in selected) {
		const { [id]: _removed, ...rest } = selected;
		selected = rest;
		return;
	}
	const color = nextFreeColor(Object.values(selected));
	if (color) selected = { ...selected, [id]: color };
}

function changeColor(id: string) {
	const others = Object.entries(selected)
		.filter(([other]) => other !== id)
		.map(([, color]) => color);
	const color = nextFreeColor(others, selected[id]);
	if (color) selected = { ...selected, [id]: color };
}
</script>

<svelte:head>
	<title>New game</title>
</svelte:head>

<PageHeader title="New game" backHref="/home" />

{#if data.activeGameId}
	<div class="mt-8 rounded-3xl border-2 border-ink bg-surface p-5">
		<p class="font-display text-xl font-semibold">
			A game is already in progress
		</p>
		<p class="mt-1 text-muted">Finish or discard it before starting another.</p>
		<div class="mt-4">
			<Button href="/game/{data.activeGameId}" block>Resume game</Button>
		</div>
	</div>
{:else}
	<h2 class="mt-6 font-display text-2xl font-semibold">Who's playing?</h2>
	<p class="mt-1 font-semibold text-muted">
		Tap to join. Tap a color dot to change a meeple.
	</p>

	<form method="POST" action="?/start" use:enhance class="flex flex-1 flex-col">
		{#each Object.entries(selected) as [id, color] (id)}
			<input type="hidden" name="player" value="{id}:{color}">
		{/each}

		<ul class="mt-5 flex flex-col gap-3">
			{#each data.players as player (player.id)}
				{@const color = selected[player.id]}
				{@const chosen = color !== undefined}
				<li
					class="flex items-center gap-2 rounded-3xl pr-3 {chosen
						? "border-2 border-ink bg-surface"
						: "border-2 border-dashed border-line bg-surface/60"}"
				>
					<label
						class="flex min-h-[64px] min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-3xl py-3 pl-4 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
					>
						<input
							type="checkbox"
							class="peer sr-only"
							checked={chosen}
							disabled={!chosen && full}
							on:change={() => toggle(player.id)}
						>
						<span
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ink {chosen
								? "border-meeple-yellow bg-meeple-yellow text-on-yellow"
								: "border-line"}"
							aria-hidden="true"
						>
							{#if chosen}
								<CheckIcon size="20" />
							{/if}
						</span>
						<span
							class="min-w-0 truncate font-display text-xl font-semibold {chosen
								? ""
								: "text-muted"}"
						>
							{player.name}
						</span>
					</label>
					{#if chosen}
						<button
							type="button"
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
							aria-label="Meeple color for {player.name}: {color}. Tap to change."
							on:click={() => changeColor(player.id)}
						>
							<MeepleDot {color} figure size={36} />
						</button>
					{/if}
				</li>
			{:else}
				<li
					class="rounded-3xl border-2 border-dashed border-line p-5 text-muted"
				>
					No players yet. Add the people at your table first.
				</li>
			{/each}
		</ul>

		<a href="/players" class="mt-5 font-bold text-ink underline">
			Need someone new? Add a player
		</a>

		{#if form?.error}
			<p class="mt-4 font-bold text-meeple-red" role="alert">{form.error}</p>
		{/if}

		<div class="mt-auto pt-8">
			<Button type="submit" block disabled={!canStart}>
				{#if canStart}
					Start game · {count} players
				{:else}
					Pick at least {MIN_PLAYERS} players
				{/if}
			</Button>
		</div>
	</form>
{/if}
