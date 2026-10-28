<script lang="ts">
export let error: string | undefined = undefined;
</script>

<form method="post" action="/?/login">
	<h1 class="h2 mb-4">Sign in</h1>
	<div class="flex flex-col">
		<div>
			<label class="label" for="password">Password</label>
			<input
				class="input"
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			>
		</div>
		{#if error}
			<p class="text-error-500 mt-2" role="alert">{error}</p>
		{/if}
	</div>
	<button type="submit" class="btn flex flex-auto variant-ghost-primary mt-5">
		Login
	</button>
</form>
