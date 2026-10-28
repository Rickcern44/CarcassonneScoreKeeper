<script lang="ts">
import { type MeepleColor, meepleBg, meepleText } from "#lib/meeple.js";
import Meeple from "./Meeple.svelte";

export let color: MeepleColor = "red";
export let label: string | undefined = undefined;
/** Show a meeple figure instead of an initial. */
export let figure = false;
export let size = 40;
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold {meepleBg[
		color
	]} {meepleText[color]}"
	style="width: {size}px; height: {size}px; font-size: {size * 0.45}px"
	aria-hidden={label ? undefined : "true"}
>
	{#if figure}
		<Meeple size={size * 0.55} />
	{:else}
		{label ?? ""}
	{/if}
</span>
