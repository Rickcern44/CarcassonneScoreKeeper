<script lang="ts">
import { flip } from "svelte/animate";
import { RotateCcwIcon } from "svelte-feather-icons";
import { enhance } from "$app/forms";
import { meepleBg, meepleText } from "$lib/meeple";
import Button from "../../../../components/Button.svelte";
import GameResults from "../../../../components/GameResults.svelte";
import KeypadSheet from "../../../../components/KeypadSheet.svelte";
import PageHeader from "../../../../components/PageHeader.svelte";
import type { ActionData, PageData } from "./$types";

export let data: PageData;
export let form: ActionData;

const QUICK_POINTS = [-1, 1, 3, 5];

let selectedId: string | null = null;
let keypadFor: string | null = null;
let confirmingFinish = false;

$: detail = data.detail;
$: active = detail.game.status === "active";
$: keypadPlayer = detail.players.find((p) => p.playerId === keypadFor);

const pointsLabel = (points: number, name: string) =>
	points < 0
		? `Subtract ${Math.abs(points)} point from ${name}`
		: `Add ${points} point${points === 1 ? "" : "s"} to ${name}`;
const pointsText = (points: number) =>
	points < 0 ? `−${-points}` : `+${points}`;
</script>

<svelte:head>
	<title>{active ? "Scoreboard" : "Game over"}</title>
</svelte:head>

{#if !active}
	<GameResults {detail} error={form?.error} />
{:else}
	<PageHeader title="Scoreboard" backHref="/home">
		<form method="POST" action="?/undo" use:enhance>
			<button
				type="submit"
				disabled={detail.eventCount === 0}
				class="flex min-h-[44px] items-center gap-2 rounded-2xl border-2 border-line bg-surface px-4 font-display text-lg font-semibold text-muted enabled:border-ink enabled:text-ink disabled:opacity-60"
			>
				<RotateCcwIcon size="20" />
				Undo
			</button>
		</form>
	</PageHeader>

	<p class="mt-4 font-semibold text-muted">Tap a player to add points.</p>

	{#if form?.error}
		<p class="mt-2 font-bold text-meeple-red" role="alert">{form.error}</p>
	{/if}

	<ol class="mt-4 flex flex-col gap-3">
		{#each detail.players as player (player.playerId)}
			{@const open = selectedId === player.playerId}
			<li
				animate:flip={{ duration: 250 }}
				class="rounded-[28px] {meepleBg[player.color]} {meepleText[
					player.color
				]}"
			>
				<button
					type="button"
					class="flex w-full items-center gap-4 px-5 py-4 text-left"
					aria-expanded={open}
					aria-label="{player.name}, rank {player.rank}, {player.score} points"
					on:click={() => (selectedId = open ? null : player.playerId)}
				>
					<span
						class="w-5 text-center font-display text-lg font-bold opacity-90"
					>
						<span class="sr-only">Rank</span>{player.rank}
					</span>
					<span
						class="min-w-0 flex-1 truncate font-display text-2xl font-semibold"
					>
						{player.name}
					</span>
					<span
						class="font-display text-5xl font-bold tabular-nums"
						aria-hidden="true"
					>
						{player.score}
					</span>
				</button>

				{#if open}
					<form
						method="POST"
						action="?/score"
						use:enhance
						class="grid grid-cols-5 gap-2 px-4 pb-4"
					>
						<input type="hidden" name="playerId" value={player.playerId}>
						{#each QUICK_POINTS as points}
							<button
								type="submit"
								name="points"
								value={points}
								aria-label={pointsLabel(points, player.name)}
								class="min-h-[52px] rounded-2xl bg-chip font-display text-xl font-bold text-on-chip"
							>
								{pointsText(points)}
							</button>
						{/each}
						<button
							type="button"
							aria-label="Enter a custom amount for {player.name}"
							class="flex min-h-[52px] items-center justify-center rounded-2xl bg-key text-on-key"
							on:click={() => (keypadFor = player.playerId)}
						>
							<svg
								viewBox="0 0 24 24"
								width="24"
								height="24"
								fill="currentColor"
								aria-hidden="true"
							>
								{#each [5, 12, 19] as x}
									{#each [5, 12, 19] as y}
										<circle cx={x} cy={y} r="2" />
									{/each}
								{/each}
							</svg>
						</button>
					</form>
				{/if}
			</li>
		{/each}
	</ol>

	<div class="mt-auto pt-8">
		{#if confirmingFinish}
			<div
				class="rounded-3xl border-2 border-ink bg-surface p-5"
				role="alertdialog"
				aria-labelledby="finish-title"
			>
				<p id="finish-title" class="font-display text-xl font-semibold">
					Finish this game?
				</p>
				<p class="mt-1 text-muted">
					Scores will be locked and added to History.
				</p>
				<div class="mt-4 flex flex-col gap-3">
					<form method="POST" action="?/finish" use:enhance>
						<Button type="submit" block>Finish game</Button>
					</form>
					<Button
						variant="secondary"
						block
						on:click={() => (confirmingFinish = false)}
					>
						Keep playing
					</Button>
					<form method="POST" action="?/discard" use:enhance>
						<button
							type="submit"
							class="min-h-[44px] w-full text-sm font-bold text-muted underline"
						>
							Discard this game instead (deletes its scores)
						</button>
					</form>
				</div>
			</div>
		{:else}
			<Button
				variant="secondary"
				block
				on:click={() => (confirmingFinish = true)}
			>
				Finish game
			</Button>
		{/if}
	</div>

	{#if keypadPlayer}
		<KeypadSheet
			playerId={keypadPlayer.playerId}
			name={keypadPlayer.name}
			score={keypadPlayer.score}
			on:close={() => (keypadFor = null)}
		/>
	{/if}
{/if}
