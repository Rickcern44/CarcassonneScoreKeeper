<script lang="ts">
import "../app.css";
import Authentication from "../components/Authentication.svelte";
import type { PageData } from "./$types";

export let data: PageData;

let { supabase } = data;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<section class="flex container h-2/3 justify-center">
	<div class="flex flex-center self-center">
		<Authentication {supabase} />
	</div>
</section>
