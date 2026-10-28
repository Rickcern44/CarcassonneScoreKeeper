<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import { online } from "svelte/reactivity/window";
import { DeleteIcon } from "svelte-feather-icons";
import { enhance } from "$app/forms";

export let playerId: string;
export let name: string;
export let score: number;

$: offline = !online.current;

const MAX_DIGITS = 3;
const dispatch = createEventDispatcher<{ close: undefined }>();

let sheet: HTMLDivElement;
let mode: "add" | "subtract" = "add";
let digits = "";

$: amount = digits ? Number(digits) : 0;
$: signed = mode === "add" ? amount : -amount;
$: confirmLabel =
	amount === 0
		? "Enter points"
		: mode === "add"
			? `Add ${amount} to ${name}`
			: `Subtract ${amount} from ${name}`;

function press(digit: string) {
	if (digits.length >= MAX_DIGITS) return;
	if (digits === "" && digit === "0") return;
	digits += digit;
}

function close() {
	dispatch("close");
}

function focusable(): HTMLElement[] {
	return Array.from(
		sheet.querySelectorAll<HTMLElement>("button:not([disabled])"),
	);
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.preventDefault();
		close();
	} else if (/^[0-9]$/.test(event.key)) {
		press(event.key);
	} else if (event.key === "Backspace") {
		digits = digits.slice(0, -1);
	} else if (event.key === "Tab") {
		// Keep focus inside the sheet while it is open.
		const items = focusable();
		const first = items[0];
		const last = items[items.length - 1];
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

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const keyClass =
	"flex min-h-[56px] items-center justify-center rounded-2xl bg-bg font-display text-2xl font-semibold text-ink active:bg-line";
</script>

<div class="fixed inset-0 z-30 flex items-end justify-center">
	<button
		type="button"
		class="absolute inset-0 bg-black/50"
		aria-label="Close keypad"
		tabindex="-1"
		on:click={close}
	></button>

	<div
		bind:this={sheet}
		role="dialog"
		aria-modal="true"
		aria-label="Enter points for {name}"
		tabindex="-1"
		class="relative w-full max-w-md rounded-t-[32px] bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 text-ink outline-hidden"
		on:keydown={onKeydown}
	>
		<div class="flex items-baseline justify-between">
			<p class="font-display text-xl font-semibold">{name}</p>
			<p
				class="font-display text-xl font-semibold text-muted"
				aria-live="polite"
			>
				{score}
				<span aria-hidden="true">→</span>
				<span class="sr-only">becomes</span>
				<span class="text-ink">{score + signed}</span>
			</p>
		</div>

		<fieldset class="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-bg p-1">
			<legend class="sr-only">Add or subtract</legend>
			{#each [
				["add", "Add"],
				["subtract", "Subtract"],
			] as [value, text]}
				<button
					type="button"
					class="min-h-[44px] rounded-xl font-display text-lg font-semibold {mode ===
					value
						? "bg-meeple-yellow text-on-yellow"
						: "text-muted"}"
					aria-pressed={mode === value}
					on:click={() => (mode = value as "add" | "subtract")}
				>
					{text}
				</button>
			{/each}
		</fieldset>

		<p
			class="my-3 text-center font-display text-6xl font-bold tabular-nums"
			aria-live="polite"
		>
			<span class="sr-only">Amount</span>
			{mode === "subtract" && amount > 0 ? "−" : ""}{amount}
		</p>

		<div class="grid grid-cols-3 gap-2">
			{#each keys as key}
				<button type="button" class={keyClass} on:click={() => press(key)}>
					{key}
				</button>
			{/each}
			<button
				type="button"
				class="{keyClass} text-lg"
				aria-label="Clear amount"
				on:click={() => (digits = "")}
			>
				C
			</button>
			<button type="button" class={keyClass} on:click={() => press("0")}>
				0
			</button>
			<button
				type="button"
				class={keyClass}
				aria-label="Delete last digit"
				on:click={() => (digits = digits.slice(0, -1))}
			>
				<DeleteIcon size="24" />
			</button>
		</div>

		<form
			method="POST"
			action="?/score"
			class="mt-4"
			use:enhance={() =>
				async ({ result, update }) => {
					await update();
					if (result.type === "success") close();
				}}
		>
			<input type="hidden" name="playerId" value={playerId}>
			<input type="hidden" name="points" value={signed}>
			<button
				type="submit"
				disabled={offline || amount === 0}
				class="min-h-[56px] w-full rounded-2xl border-2 border-shadow-ink bg-meeple-yellow font-display text-xl font-semibold text-on-yellow shadow-[0_4px_0_0_var(--shadow-ink)] disabled:opacity-50"
			>
				{confirmLabel}
			</button>
		</form>
	</div>
</div>
