<script lang="ts">
import type { AppEnv } from "#lib/appEnv.js";
import { identityFor } from "#lib/appEnv.js";

let { env }: { env: AppEnv } = $props();

const banner = $derived(identityFor(env).banner);
</script>

{#if banner}
	<!-- Normal flow at the very top: content is pushed down, never covered.
	     The top padding keeps the text clear of the notch in standalone mode. -->
	<div
		role="note"
		data-env-banner={env}
		class="px-3 pb-1.5 pt-[calc(env(safe-area-inset-top)+0.375rem)] text-center text-xs font-extrabold tracking-wide {env ===
		"staging"
			? "bg-[#f97316] text-[#1a1208]"
			: "bg-[#7c3aed] text-white"}"
	>
		{banner}
	</div>
{/if}
