<script lang="ts">
import { type MeepleColor, meepleBg, meepleText } from "#lib/meeple.js";

export let name: string;
export let score: number;
export let color: MeepleColor;
</script>

<span
	class="inline-flex rounded-full px-4 py-2 text-base font-extrabold {meepleBg[
		color
	]} {meepleText[color]}"
>
	{name}
	{score}
</span>
