<script lang="ts">
export let outlined = false;
</script>

<div
	class="rounded-3xl bg-surface p-4 {outlined ? "border-2 border-ink p-5" : ""}"
>
	<slot />
</div>
