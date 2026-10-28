<script lang="ts">
import Login from "../components/Login.svelte";
import type { ActionData } from "./$types";

export let form: ActionData;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main class="mx-auto min-h-full max-w-md px-7 pb-10 pt-12">
	<Login error={form?.error} />
</main>
