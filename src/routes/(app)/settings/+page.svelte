<script lang="ts">
import { onMount } from "svelte";
import { getThemeMode, setThemeMode, type ThemeMode } from "$lib/theme";
import Button from "../../../components/Button.svelte";
import PageTitle from "../../../components/PageTitle.svelte";

const modes: { value: ThemeMode; label: string }[] = [
	{ value: "system", label: "System" },
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
];

let mode: ThemeMode = "system";

onMount(() => {
	mode = getThemeMode();
});

function choose(value: ThemeMode) {
	mode = value;
	setThemeMode(value);
}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<PageTitle>Settings</PageTitle>

<fieldset class="mt-6">
	<legend class="font-display text-xl font-semibold">Appearance</legend>
	<p class="mt-1 text-sm font-semibold text-muted">
		System follows your device. Your choice is remembered on this device.
	</p>
	<div class="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
		{#each modes as { value, label }}
			<button
				type="button"
				aria-pressed={mode === value}
				class="min-h-[44px] rounded-xl font-display text-lg font-semibold {mode ===
				value
					? "bg-meeple-yellow text-on-yellow"
					: "text-muted"}"
				on:click={() => choose(value)}
			>
				{label}
			</button>
		{/each}
	</div>
</fieldset>

<form method="post" action="/?/logout" class="mt-8">
	<Button type="submit" variant="secondary" block>Logout</Button>
</form>
