<script lang="ts">
import { online } from "svelte/reactivity/window";
import { joinNames } from "#lib/format.js";
import { meepleBg, meepleText } from "#lib/meeple.js";
import type { GameDetail } from "#lib/services/gameService.js";
import { enhance } from "$app/forms";
import Button from "./Button.svelte";
import Crown from "./Crown.svelte";
import RankRow from "./RankRow.svelte";

export let detail: GameDetail;
export let error: string | undefined = undefined;

$: offline = !online.current;
$: winners = detail.players.filter((player) => player.rank === 1);
$: tied = winners.length > 1;
$: leader = winners[0];
</script>

<h1 class="font-display text-4xl font-bold">Game over</h1>

<section
	class="mt-5 rounded-[32px] border-2 border-shadow-ink px-6 py-8 text-center {tied
		? "bg-surface text-ink border-ink"
		: `${meepleBg[leader.color]} ${meepleText[leader.color]}`}"
	aria-label={tied ? "Tied winners" : "Winner"}
>
	<div class="flex justify-center"><Crown size={56} /></div>
	<p class="mt-3 font-display text-lg font-bold uppercase tracking-wide">
		{tied ? "Tie for the win" : "Winner"}
	</p>
	<p class="mt-1 font-display text-5xl font-bold">
		{joinNames(winners.map((player) => player.name))}
	</p>
	<p class="mt-1 font-display text-2xl font-semibold">
		{leader.score}
		points{tied ? " each" : ""}
	</p>
</section>

<h2 class="mt-7 font-display text-2xl font-semibold">Final standings</h2>
<ol class="mt-3 flex flex-col gap-3">
	{#each detail.players as player (player.playerId)}
		<li>
			<RankRow
				rank={player.rank}
				name={player.name}
				score={player.score}
				color={player.color}
				large={false}
			/>
		</li>
	{/each}
</ol>

{#if error}
	<p class="mt-4 font-bold text-meeple-red" role="alert">{error}</p>
{/if}

<div class="mt-8 flex flex-col gap-3">
	<form method="POST" action="?/rematch" use:enhance>
		<Button type="submit" block disabled={offline}
			>Rematch with the same players</Button
		>
	</form>
	<Button href="/home" variant="secondary" block>Back to home</Button>
</div>
