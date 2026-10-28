<script lang="ts">
import "../app.css";
import Login from "../components/Login.svelte";
import type { ActionData } from "./$types";

export let form: ActionData;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<section class="flex container h-2/3 justify-center">
	<div class="flex flex-center self-center">
		<Login error={form?.error} />
	</div>
</section>
