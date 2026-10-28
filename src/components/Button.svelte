<script lang="ts">
export let variant: "primary" | "secondary" = "primary";
export let href: string | undefined = undefined;
export let type: "button" | "submit" = "button";
export let block = false;
export let disabled = false;

$: classes = [
	"inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-2 px-5 py-2 font-display text-lg font-semibold transition-transform",
	variant === "primary"
		? "border-shadow-ink bg-meeple-yellow text-on-yellow shadow-[0_4px_0_0_var(--shadow-ink)] active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--shadow-ink)]"
		: "border-ink bg-surface text-ink",
	disabled ? "pointer-events-none opacity-50" : "",
	block ? "w-full" : "",
].join(" ");
</script>

{#if href}
	<!-- biome-ignore lint/a11y/useAnchorContent: content comes from the slot -->
	<a {href} class={classes} aria-disabled={disabled || undefined}><slot /></a>
{:else}
	<button {type} {disabled} class={classes} on:click><slot /></button>
{/if}
