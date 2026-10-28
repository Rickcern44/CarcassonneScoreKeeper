<script lang="ts">
import { PlusIcon } from "svelte-feather-icons";
import { formatGameDate, joinNames } from "#lib/format.js";
import { meepleBg, meepleText } from "#lib/meeple.js";
import Button from "../../../components/Button.svelte";
import Meeple from "../../../components/Meeple.svelte";
import MeepleDot from "../../../components/MeepleDot.svelte";
import type { PageData } from "./$types";

export let data: PageData;
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="flex items-center gap-3">
	<span
		class="flex h-10 w-10 items-center justify-center rounded-xl bg-meeple-red text-white"
	>
		<Meeple size={24} />
	</span>
	<h1 class="font-display text-4xl font-bold">Carcassonne</h1>
</div>

{#if data.active}
	<section
		class="mt-6 rounded-[32px] border-2 border-ink bg-surface p-5"
		aria-labelledby="in-progress"
	>
		<div class="flex items-center justify-between">
			<h2 id="in-progress" class="font-display text-2xl font-semibold">
				Game in progress
			</h2>
			<span
				class="rounded-full bg-meeple-yellow px-3 py-1 text-sm font-extrabold text-on-yellow"
			>
				LIVE
			</span>
		</div>
		<ul class="mt-4 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
			{#each data.active.players as player (player.playerId)}
				<li
					class="flex flex-col items-center rounded-2xl px-2 py-3 {meepleBg[
						player.color
					]} {meepleText[player.color]}"
				>
					<span class="max-w-full truncate text-sm font-bold"
						>{player.name}</span
					>
					<span class="font-display text-3xl font-bold tabular-nums"
						>{player.score}</span
					>
				</li>
			{/each}
		</ul>
		<div class="mt-4">
			<Button href="/game/{data.active.game.id}" block>Resume game</Button>
		</div>
	</section>
{/if}

<div class="mt-4">
	<Button href="/newgame" variant="secondary" block>
		<PlusIcon size="22" />
		New game
	</Button>
</div>

<div class="mt-8 flex items-baseline justify-between">
	<h2 class="font-display text-2xl font-semibold">Recent games</h2>
	{#if data.recent.length > 0}
		<a href="/history" class="font-bold underline">See all</a>
	{/if}
</div>

{#if data.recent.length === 0}
	<p class="mt-3 rounded-3xl bg-surface p-5 text-muted">
		No finished games yet. Start one and it will show up here.
	</p>
{:else}
	<ul class="mt-3 flex flex-col gap-3">
		{#each data.recent as { game, players } (game.id)}
			{@const winners = players.filter((player) => player.rank === 1)}
			<li>
				<a
					href="/game/{game.id}"
					class="flex min-h-[44px] items-center gap-4 rounded-3xl bg-surface p-4"
				>
					<MeepleDot
						color={winners[0].color}
						label={winners[0].name.charAt(0).toUpperCase()}
						size={52}
					/>
					<span class="min-w-0 flex-1">
						<span class="block truncate font-display text-xl font-semibold">
							{joinNames(winners.map((w) => w.name))}
							{winners.length > 1 ? "tied" : "won"}
						</span>
						<span class="block text-sm font-bold text-muted">
							{formatGameDate(game.finished_at ?? game.created_at)}
							· {players.length} players
						</span>
					</span>
					<span class="font-display text-3xl font-bold tabular-nums">
						{winners[0].score}
					</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}
