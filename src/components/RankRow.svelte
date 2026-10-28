<script lang="ts">
import { type MeepleColor, meepleBg, meepleText } from "$lib/meeple";

export let rank: number;
export let name: string;
export let score: number;
export let color: MeepleColor;
export let large = true;
</script>

<div
	class="flex items-center gap-4 {meepleBg[color]} {meepleText[color]} {large
		? "rounded-[28px] px-5 py-4"
		: "rounded-3xl px-5 py-3"}"
>
	<span class="w-5 text-center font-display text-lg font-bold opacity-90">
		<span class="sr-only">Rank </span>{rank}
	</span>
	<span class="min-w-0 flex-1 truncate font-display text-2xl font-semibold">
		{name}
	</span>
	<span
		class="font-display font-bold tabular-nums {large
			? "text-5xl"
			: "text-3xl"}"
	>
		{score}
	</span>
</div>
