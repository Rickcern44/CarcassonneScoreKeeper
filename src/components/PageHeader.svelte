<script lang="ts">
import { ArrowLeftIcon } from "svelte-feather-icons";

export let title: string;
export let backHref: string | undefined = undefined;
</script>

<header class="flex items-center gap-3">
	{#if backHref}
		<a
			href={backHref}
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
			aria-label="Back"
		>
			<ArrowLeftIcon size="26" />
		</a>
	{/if}
	<h1 class="min-w-0 flex-1 truncate font-display text-3xl font-bold text-ink">
		{title}
	</h1>
	<slot />
</header>
