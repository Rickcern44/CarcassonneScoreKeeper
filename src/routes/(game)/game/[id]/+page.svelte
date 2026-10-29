<script lang="ts">
import { onDestroy, onMount } from "svelte";
import { flip } from "svelte/animate";
import { ChevronUpIcon, RotateCcwIcon } from "svelte-feather-icons";
import { relativeTime, signedPoints } from "#lib/format.js";
import { isNewChange, parseGameMessage } from "#lib/gameMessages.js";
import { meepleBg, meepleText } from "#lib/meeple.js";
import {
	createPendingScores,
	type PendingScore,
	withPending,
} from "#lib/pendingScores.js";
import { buildLogRows } from "#lib/scoreLog.js";
import { browser } from "$app/env";
import { enhance, type SubmitFunction } from "$app/forms";
import { goto, invalidate } from "$app/navigation";
import Button from "../../../../components/Button.svelte";
import GameResults from "../../../../components/GameResults.svelte";
import KeypadSheet from "../../../../components/KeypadSheet.svelte";
import MeepleDot from "../../../../components/MeepleDot.svelte";
import PageHeader from "../../../../components/PageHeader.svelte";
import ScoreLogSheet from "../../../../components/ScoreLogSheet.svelte";
import type { ActionData, PageData } from "./$types";

export let data: PageData;
export let form: ActionData;

const QUICK_POINTS = [-1, 1, 3, 5];

// Scores update straight away, but cards only move to their new rank once
// scoring has paused for this long, so they don't jump out from under a tap.
const REORDER_DELAY_MS = 1500;

let selectedId: string | null = null;
let keypadFor: string | null = null;
let confirmingFinish = false;
let logOpen = false;

let shownGameId = "";
let order: string[] = [];
let ranks: Record<string, number> = {};
let reorderTimer: ReturnType<typeof setTimeout> | undefined;

function applyOrder(current: PageData["detail"]) {
	shownGameId = current.game.id;
	order = current.players.map((player) => player.playerId);
	ranks = Object.fromEntries(
		current.players.map((player) => [player.playerId, player.rank]),
	);
}

function scheduleReorder(current: PageData["detail"]) {
	clearTimeout(reorderTimer);
	const sameCards =
		current.game.id === shownGameId &&
		order.length === current.players.length &&
		current.players.every((player) => order.includes(player.playerId));
	if (sameCards) {
		reorderTimer = setTimeout(() => applyOrder(current), REORDER_DELAY_MS);
	} else {
		applyOrder(current);
	}
}

// Taps show at once. Each is added here and stays until the server has saved it
// and a reload that followed has confirmed it (see src/lib/pendingScores.ts).
let pendingEntries: readonly PendingScore[] = [];
const pending = createPendingScores((entries) => {
	pendingEntries = entries;
});
let scoreError = "";

// Plain state rather than `online` from svelte/reactivity/window: the `$:`
// statements below only re-run for variables of this component, so they would
// never notice the device going offline or coming back.
let isOnline = true;
onMount(() => {
	isOnline = navigator.onLine;
	const up = () => (isOnline = true);
	const down = () => (isOnline = false);
	window.addEventListener("online", up);
	window.addEventListener("offline", down);
	return () => {
		window.removeEventListener("online", up);
		window.removeEventListener("offline", down);
	};
});

// Live updates and reconnects both land here. Missed updates are fetched when
// the device is back online; see sync().
let missedUpdates = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
const RETRY_MS = 5000;

/**
 * Reloads the game. Never while offline: a saved page has no data to serve for
 * the request, and SvelteKit would replace this page with an error page that
 * never recovers. A failed reload keeps the scores on screen and is retried.
 */
async function reload(): Promise<boolean> {
	if (!isOnline) {
		missedUpdates = true;
		return false;
	}
	try {
		await invalidate("app:game");
		return true;
	} catch {
		missedUpdates = true;
		clearTimeout(retryTimer);
		retryTimer = setTimeout(sync, RETRY_MS);
		return false;
	}
}

let reconciling = false;
async function reconcile() {
	if (reconciling) return;
	reconciling = true;
	try {
		for (let ids = pending.settled(); ids.length > 0; ids = pending.settled()) {
			// Without fresh data the saved taps stay shown, so nothing is lost.
			if (!(await reload())) break;
			pending.drop(ids);
		}
	} finally {
		reconciling = false;
	}
}

const saveScore: SubmitFunction = ({ formData }) => {
	const playerId = String(formData.get("playerId"));
	const id = pending.add(playerId, Number(formData.get("points")));
	scoreError = "";
	return async ({ result }) => {
		const ok = result.type === "success";
		pending.finish(id, ok);
		if (!ok) {
			scoreError =
				result.type === "failure" && typeof result.data?.error === "string"
					? result.data.error
					: "Couldn't save that score. Try again.";
			// A lost response may still have been saved, so resync.
			if (!pending.active) await reload();
		}
		await reconcile();
	};
};

// Live updates: the server says when this game changed, then the game reloads.
let source: EventSource | undefined;

function sync() {
	if (!isOnline) {
		missedUpdates = true;
		return;
	}
	// Our own taps reload when they settle; a reload now could count them twice.
	if (pending.inFlight) return;
	missedUpdates = false;
	if (pending.active) reconcile();
	else reload();
}

function disconnect() {
	if (!source) return;
	source.close();
	source = undefined;
	missedUpdates = true;
}

function connect(gameId: string) {
	disconnect();
	source = new EventSource(`/game/${gameId}/events`);
	// EventSource retries by itself; whatever it missed is fetched when it is back.
	source.onerror = () => {
		missedUpdates = true;
	};
	source.onopen = () => {
		if (missedUpdates) {
			missedUpdates = false;
			sync();
		}
	};
	source.onmessage = (event) => {
		const message = parseGameMessage(event.data);
		if (!message) return;
		if (message.type === "discarded") goto("/home?notice=discarded");
		else if (message.type === "rematch") goto(`/game/${message.gameId}`);
		else if (isNewChange(message, serverView)) sync();
	};
}

$: gameId = data.detail.game.id;
// A rematch reuses this page for a new game, so start it with a clean screen.
let uiGameId = "";
$: if (gameId !== uiGameId) {
	uiGameId = gameId;
	selectedId = null;
	keypadFor = null;
	confirmingFinish = false;
	logOpen = false;
	scoreError = "";
}
$: serverView = {
	eventCount: data.detail.eventCount,
	lastEventId: data.detail.lastEventId,
	status: data.detail.game.status,
};
// Closed while offline (see the offline banner); resyncs when it is reopened.
$: if (browser) {
	if (isOnline) connect(gameId);
	else disconnect();
}

onDestroy(() => {
	clearTimeout(reorderTimer);
	clearTimeout(retryTimer);
	source?.close();
});

$: detail = withPending(data.detail, pendingEntries);
$: scheduleReorder(detail);
$: shown = order.flatMap((id) => {
	const player = detail.players.find((p) => p.playerId === id);
	return player ? [{ ...player, rank: ranks[id] ?? player.rank }] : [];
});
// Undo and Finish wait until our own taps are saved, so they act on what is shown.
$: unconfirmed = pendingEntries.length > 0;
$: active = detail.game.status === "active";
// Saved pages can be read offline, but a form posted with no network would just fail.
$: offline = !isOnline;
$: keypadPlayer = shown.find((p) => p.playerId === keypadFor);

const pointsLabel = (points: number, name: string) =>
	points < 0
		? `Subtract ${Math.abs(points)} point from ${name}`
		: `Add ${points} point${points === 1 ? "" : "s"} to ${name}`;
const pointsText = signedPoints;

// Relative times in the strip and log tick along without a reload.
let now = new Date();
onMount(() => {
	const timer = setInterval(() => (now = new Date()), 30_000);
	return () => clearInterval(timer);
});

$: logRows = buildLogRows(data.detail.players, pendingEntries, data.log);
$: latest = logRows[0];
$: latestWhen = latest?.createdAt ? relativeTime(latest.createdAt, now) : "";
$: latestWhenLong = latest?.createdAt
	? relativeTime(latest.createdAt, now, true)
	: "";
</script>

<svelte:head>
	<title>{active ? "Scoreboard" : "Game over"}</title>
</svelte:head>

<svelte:document
	on:visibilitychange={() => document.visibilityState === "visible" && sync()}
/>

{#if !active}
	<GameResults {detail} error={form?.error} />
{:else}
	<PageHeader title="Scoreboard" backHref="/home">
		<form method="POST" action="?/undo" use:enhance>
			<button
				type="submit"
				disabled={offline || data.detail.eventCount === 0 || unconfirmed}
				class="flex min-h-[44px] items-center gap-2 rounded-2xl border-2 border-line bg-surface px-4 font-display text-lg font-semibold text-muted enabled:border-ink enabled:text-ink disabled:opacity-60"
			>
				<RotateCcwIcon size="20" />
				Undo
			</button>
		</form>
	</PageHeader>

	<p class="mt-4 font-semibold text-muted">Tap a player to add points.</p>

	{#if scoreError || form?.error}
		<p class="mt-2 font-bold text-meeple-red" role="alert">
			{scoreError || form?.error}
		</p>
	{/if}

	<ol class="mt-4 flex flex-col gap-3">
		{#each shown as player (player.playerId)}
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
						use:enhance={saveScore}
						class="grid grid-cols-5 gap-2 px-4 pb-4"
					>
						<input type="hidden" name="playerId" value={player.playerId}>
						{#each QUICK_POINTS as points}
							<button
								type="submit"
								name="points"
								disabled={offline}
								value={points}
								aria-label={pointsLabel(points, player.name)}
								class="min-h-[52px] rounded-2xl bg-chip font-display text-xl font-bold text-on-chip disabled:opacity-50"
							>
								{pointsText(points)}
							</button>
						{/each}
						<button
							type="button"
							disabled={offline}
							aria-label="Enter a custom amount for {player.name}"
							class="flex min-h-[52px] items-center justify-center rounded-2xl bg-key text-on-key disabled:opacity-50"
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

	<button
		type="button"
		class="mt-4 flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-2 text-left"
		aria-label={latest
			? `Score log, latest: ${latest.name} scored ${Math.abs(latest.points)} point${Math.abs(latest.points) === 1 ? "" : "s"}${latest.points < 0 ? " less" : ""}${latest.saving ? ", saving" : latestWhenLong ? `, ${latestWhenLong}` : ""}`
			: "Score log, no scores yet"}
		aria-haspopup="dialog"
		on:click={() => (logOpen = true)}
	>
		{#if latest}
			<MeepleDot color={latest.color} label={latest.name[0]} size={28} />
			<span class="min-w-0 flex-1 truncate font-semibold">
				{latest.name}
				scored
				<span class="font-display font-bold">{pointsText(latest.points)}</span>
			</span>
			<span class="text-sm font-semibold text-muted">
				{latest.saving ? "Saving…" : latestWhen}
			</span>
		{:else}
			<span class="flex-1 font-semibold text-muted">No scores yet</span>
		{/if}
		<ChevronUpIcon size="20" class="shrink-0 text-muted" />
	</button>

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
						<Button type="submit" block disabled={offline || unconfirmed}>
							Finish game
						</Button>
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
							disabled={offline}
							class="min-h-[44px] w-full text-sm font-bold text-muted underline disabled:opacity-50"
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
				disabled={offline || unconfirmed}
				on:click={() => (confirmingFinish = true)}
			>
				Finish game
			</Button>
		{/if}
	</div>

	{#if logOpen}
		<ScoreLogSheet
			rows={logRows}
			{now}
			removalDisabled={offline || unconfirmed}
			on:close={() => (logOpen = false)}
		/>
	{/if}

	{#if keypadPlayer}
		<KeypadSheet
			playerId={keypadPlayer.playerId}
			name={keypadPlayer.name}
			score={keypadPlayer.score}
			onScore={saveScore}
			on:close={() => (keypadFor = null)}
		/>
	{/if}
{/if}
