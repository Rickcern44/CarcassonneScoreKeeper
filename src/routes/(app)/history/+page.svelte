<script lang="ts">
import { formatGameDate, joinNames } from "#lib/format.js";
import Crown from "../../../components/Crown.svelte";
import PageTitle from "../../../components/PageTitle.svelte";
import ScorePill from "../../../components/ScorePill.svelte";
import type { PageData } from "./$types";

export let data: PageData;
</script>

<svelte:head>
	<title>History</title>
</svelte:head>

<PageTitle>History</PageTitle>

{#if data.games.length === 0}
	<p class="mt-4 rounded-3xl bg-surface p-5 text-muted">
		Finished games will show up here.
	</p>
{:else}
	<ul class="mt-5 flex flex-col gap-3">
		{#each data.games as { game, players } (game.id)}
			{@const winners = players.filter((player) => player.rank === 1)}
			<li>
				<a href="/game/{game.id}" class="block rounded-3xl bg-surface p-5">
					<div class="flex items-center justify-between gap-3">
						<span class="font-bold text-muted">
							{formatGameDate(game.finished_at ?? game.created_at)}
						</span>
						<span
							class="flex min-w-0 items-center gap-2 font-display text-xl font-bold"
						>
							<Crown size={26} />
							<span class="truncate">
								{joinNames(winners.map((w) => w.name))}
								· {winners[0].score}
							</span>
						</span>
					</div>
					<ul class="mt-3 flex flex-wrap gap-2">
						{#each players as player (player.playerId)}
							<li>
								<ScorePill
									name={player.name}
									score={player.score}
									color={player.color}
								/>
							</li>
						{/each}
					</ul>
				</a>
			</li>
		{/each}
	</ul>
{/if}
