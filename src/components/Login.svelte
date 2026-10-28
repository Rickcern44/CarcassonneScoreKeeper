<script lang="ts">
import Button from "./Button.svelte";
import Meeple from "./Meeple.svelte";

export let error: string | undefined = undefined;

// 4x3 board of terrain tiles; the red tile holds the meeple.
const tiles = [
	"field",
	"road",
	"city",
	"field",
	"road",
	"meeple",
	"city",
	"field",
	"city",
	"field",
	"road",
	"road",
];
const tileClasses: Record<string, string> = {
	field: "bg-tile-field",
	road: "bg-tile-road",
	city: "bg-tile-city",
	meeple: "bg-meeple-red text-white",
};
</script>

<form method="post" action="/?/login" class="w-full">
	<div class="grid grid-cols-4 gap-2" aria-hidden="true">
		{#each tiles as tile}
			<div
				class="flex aspect-square items-center justify-center rounded-2xl {tileClasses[
					tile
				]}"
			>
				{#if tile === "meeple"}
					<Meeple size={36} />
				{/if}
			</div>
		{/each}
	</div>

	<h1 class="mt-10 font-display text-5xl font-bold text-ink">Carcassonne</h1>
	<p class="font-display text-2xl font-semibold text-muted">Score keeper</p>

	<label class="mt-10 block text-sm font-extrabold text-ink" for="password">
		Table password
	</label>
	<input
		class="mt-2 min-h-[56px] w-full rounded-2xl border-2 border-ink bg-surface px-4 text-lg text-ink placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-meeple-yellow"
		id="password"
		name="password"
		type="password"
		placeholder="Shared with everyone at the table"
		autocomplete="current-password"
		aria-describedby={error ? "login-error" : undefined}
		required
	>
	{#if error}
		<p id="login-error" class="mt-2 font-bold text-meeple-red" role="alert">
			{error}
		</p>
	{/if}

	<div class="mt-5">
		<Button type="submit" block>Let's play</Button>
	</div>
</form>
