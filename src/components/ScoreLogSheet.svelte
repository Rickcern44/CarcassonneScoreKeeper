<script lang="ts">
import { createEventDispatcher, onMount, tick } from "svelte";
import { XIcon } from "svelte-feather-icons";
import { relativeTime, signedPoints } from "#lib/format.js";
import type { LogRow } from "#lib/scoreLog.js";
import { enhance } from "$app/forms";
import { invalidate } from "$app/navigation";
import MeepleDot from "./MeepleDot.svelte";

export let rows: LogRow[];
export let now: Date;
/** Removing waits for the server, so it is off while offline or taps are saving. */
export let removalDisabled: boolean;

const dispatch = createEventDispatcher<{ close: undefined }>();

let sheet: HTMLDivElement;
let confirming: string | null = null;
let removing: string | null = null;
let error = "";

function close() {
	dispatch("close");
}

function focusable(): HTMLElement[] {
	return Array.from(
		sheet.querySelectorAll<HTMLElement>("button:not([disabled])"),
	);
}

// Escape works even when focus was lost because the focused button went away.
function onWindowKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.preventDefault();
		close();
	}
}

async function refocus() {
	await tick();
	if (sheet && !sheet.contains(document.activeElement)) sheet.focus();
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Tab") {
		// Keep focus inside the sheet while it is open.
		const items = focusable();
		const first = items[0];
		const last = items[items.length - 1];
		if (!first) return;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
}

onMount(() => {
	const opener = document.activeElement as HTMLElement | null;
	sheet.focus();
	return () => opener?.focus();
});

// Taps start saving, or another screen changes the log, while a confirmation
// is showing: drop it if its row has gone, so nothing is removed by surprise.
$: if (confirming && !rows.some((row) => row.key === confirming)) {
	confirming = null;
}

const label = (row: LogRow) => `${signedPoints(row.points)} from ${row.name}`;
</script>

<svelte:window on:keydown={onWindowKeydown} />

<div class="fixed inset-0 z-30 flex items-end justify-center">
	<button
		type="button"
		class="absolute inset-0 bg-black/50"
		aria-label="Close score log"
		tabindex="-1"
		on:click={close}
	></button>

	<div
		bind:this={sheet}
		role="dialog"
		aria-modal="true"
		aria-label="Score log"
		tabindex="-1"
		class="relative flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-[32px] bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 text-ink outline-hidden"
		on:keydown={onKeydown}
	>
		<div class="flex items-center justify-between">
			<h2 class="font-display text-xl font-semibold">Score log</h2>
			<button
				type="button"
				class="flex h-11 w-11 items-center justify-center rounded-full text-muted"
				aria-label="Close"
				on:click={close}
			>
				<XIcon size="24" />
			</button>
		</div>

		{#if error}
			<p class="mt-1 text-sm font-bold text-meeple-red" role="alert">{error}</p>
		{/if}

		{#if rows.length === 0}
			<p class="py-8 text-center font-semibold text-muted">No scores yet</p>
		{:else}
			<ol class="mt-2 min-h-0 flex-1 divide-y divide-line overflow-y-auto">
				{#each rows as row (row.key)}
					<li class="py-2 {row.saving ? "opacity-60" : ""}">
						{#if confirming === row.key && row.eventId !== undefined}
							<form
								method="POST"
								action="?/removeEntry"
								class="flex flex-wrap items-center gap-3"
								use:enhance={() => {
									removing = row.key;
									error = "";
									return async ({ result, update }) => {
										removing = null;
										refocus();
										if (result.type === "success") {
											confirming = null;
											await update();
										} else {
											confirming = null;
											error =
												result.type === "failure" &&
												typeof result.data?.error === "string"
													? result.data.error
													: "Couldn't remove that entry. Try again.";
											// The log may be out of date, so show what is there now.
											await invalidate("app:game");
										}
									};
								}}
							>
								<input type="hidden" name="eventId" value={row.eventId}>
								<p class="min-w-0 flex-1 font-semibold">
									Remove {signedPoints(row.points)} from {row.name}?
								</p>
								<button
									type="submit"
									disabled={removing === row.key || removalDisabled}
									class="min-h-[44px] rounded-2xl border-2 border-shadow-ink bg-meeple-red px-4 font-display text-lg font-semibold text-white disabled:opacity-50"
								>
									{removing === row.key ? "Removing…" : "Remove"}
								</button>
								<button
									type="button"
									class="min-h-[44px] rounded-2xl border-2 border-line px-4 font-display text-lg font-semibold"
									on:click={() => {
										confirming = null;
										refocus();
									}}
								>
									Keep
								</button>
							</form>
						{:else}
							<div class="flex items-center gap-3">
								<MeepleDot color={row.color} label={row.name[0]} size={32} />
								<div class="min-w-0 flex-1">
									<p class="truncate font-semibold">{row.name}</p>
									<p class="text-sm text-muted">
										{#if row.saving}
											Saving…
										{:else if row.createdAt}
											{relativeTime(row.createdAt, now)}
										{/if}
									</p>
								</div>
								<span class="font-display text-2xl font-bold tabular-nums">
									{signedPoints(row.points)}
								</span>
								<span
									class="w-14 text-right text-sm font-semibold tabular-nums text-muted"
								>
									{#if row.runningTotal !== undefined}
										<span aria-hidden="true">→</span>
										<span class="sr-only">total</span>
										{row.runningTotal}
									{/if}
								</span>
								{#if row.eventId !== undefined}
									<button
										type="button"
										disabled={removalDisabled}
										aria-label="Remove {label(row)}"
										class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted disabled:opacity-40"
										on:click={() => {
											error = "";
											confirming = row.key;
										}}
									>
										<XIcon size="20" />
									</button>
								{:else}
									<span class="h-11 w-11 shrink-0"></span>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</div>
