<script lang="ts">
import { online } from "svelte/reactivity/window";
</script>

{#if !online.current}
	<p
		class="mb-3 rounded-2xl border-2 border-ink bg-surface px-4 py-2 text-sm font-bold text-ink"
		role="status"
	>
		Offline: showing saved scores, changes are disabled.
	</p>
{/if}
