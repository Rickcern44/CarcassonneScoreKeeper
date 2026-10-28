<script lang="ts">
export let variant: "primary" | "secondary" = "primary";
export let href: string | undefined = undefined;
export let type: "button" | "submit" = "button";
export let block = false;

$: classes = [
	"inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-2 border-ink px-5 py-2 font-display text-lg font-semibold text-ink transition-transform active:translate-y-[2px]",
	variant === "primary"
		? "bg-meeple-yellow shadow-[0_4px_0_0_var(--ink)] active:shadow-[0_2px_0_0_var(--ink)]"
		: "bg-surface",
	block ? "w-full" : "",
].join(" ");
</script>

{#if href}
	<!-- biome-ignore lint/a11y/useAnchorContent: content comes from the slot -->
	<a {href} class={classes}><slot /></a>
{:else}
	<button {type} class={classes} on:click><slot /></button>
{/if}
